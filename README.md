# ti-crittercism-hook

A CLI hook for Appcelerator Titanium to automatically upload dSYM files to crittercism.

## Installation

~~~
$ npm install -g ti-crittercism-hook
~~~

If you install with `sudo` and get the error `Unable to write config file...` use the following command:

```
$ sudo npm install -g ti-crittercism-hook --unsafe-perm
```

Or if you are concerned about using the `--unsafe-perm` flag, use the following command after install
to install the hook instead:

```
$ ti-crittercism-hook
```

## Usage

Add these settings to yourtiapp.xml file.


~~~
  <property name="crittercism.app_id">ENTER_APP_ID</property>
  <property name="crittercism.api_key">ENTER_API_KEY</property>
~~~

Then use the `--crittercism` flag with the titanium cli to upload to Crittercism. Example:

~~~
$ ti build -p ios -F ipad -T dist-adhoc --crittercism
~~~ 

### Licence MIT
