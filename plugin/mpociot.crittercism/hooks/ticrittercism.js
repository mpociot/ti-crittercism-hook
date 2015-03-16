var _ = require("underscore"),
    fs = require("fs"),
    afs = require("node-appc").fs,
    path = require("path"),
    Form = require("form-data"),
    archiver = require('archiver');

exports.cliVersion = '>=3.2';
var logger, form, platform, config;

exports.init = function (_logger, config, cli, appc) {
  if (process.argv.indexOf('--crittercism') !== -1) {
    cli.addHook('build.pre.compile',configure);
    cli.addHook('build.finalize', doCrittercism);
  }
  logger = _logger;
}

function configure(data,finished) {

  /*
   *  configuration/error checking
   */
  platform =  data.cli.argv.platform;

  if (data.buildManifest.outputDir === undefined && data.iosBuildDir === undefined) {
    logger.error("Output directory must be defined to use --crittercism flag");
    return;
  }

  var keys = _.keys(data.tiapp.properties).filter(function(e) { return e.match("^crittercism\.");});
  config = {};
  keys.forEach(function(k) {
    config[k.replace(/^crittercism\./,'')] = data.tiapp.properties[k].value;
  });
  if (config.app_id === undefined) {
    logger.error("crittercism.app_id is missing.");
    return;
  }
  if (config.api_key === undefined) {
    logger.error("crittercism.api_key is missing.");
    return;
  }

  finished();
}

function doCrittercism(data, finished) {
    form = new Form();

    var build_file =afs.resolvePath(path.join(data.buildManifest.outputDir, data.buildManifest.name + "." + (data.cli.argv.platform === "android" ? "apk" : "ipa")));
    form.append('key', config.api_key );

    var dsym_path = path.join(data.cli.argv["project-dir"], 'build', 'iphone','build', 'Release-iphoneos',data.buildManifest.name + ".app.dSYM");
    /**
     * Only upload if the dSYM file exists
     */
    if ( fs.existsSync(dsym_path) ) {
      logger.info("dSYM found");
      var dsym_zip = dsym_path + ".zip";
      var output = fs.createWriteStream(dsym_zip);
      var archive = archiver('zip');
      output.on('close', function() {
        logger.info("dSYM zipped");
        form.append('dsym',fs.createReadStream(dsym_zip));
        submit(form, finished);
      });
      archive.on('error', function(err) { throw err; });
      archive.pipe(output);
      archive.directory(dsym_path, data.buildManifest.name + ".app.dSYM" );
      archive.finalize();
    } else {
      logger.info( "No dSYM file available. Skipping upload" );
    }



};

function submit(form, callback) {
  var API_ENDPOINT = "https://api.crittercism.com/api_beta/dsym/" + config.app_id;
  logger.info("Uploading dSYM to " + API_ENDPOINT);
  form.submit( API_ENDPOINT , function(err, res) {
    if (err) {
      logger.error(err);
    } else {
      logger.info("Uploaded successfully.")
    }
    callback();
  });
}
