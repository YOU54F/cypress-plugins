## cypress-multi-reporters

Generate multiple mocha reports in a single mocha execution.

![npm version](https://img.shields.io/npm/v/cypress-multi-reporters.svg)
![npm](https://img.shields.io/npm/dm/cypress-multi-reporters.svg)
[![Build Status](https://travis-ci.org/you54f/cypress-multi-reporters.svg)](https://travis-ci.org/you54f/cypress-multi-reporters)
[![Coverage Status](https://coveralls.io/repos/YOU54F/cypress-multi-reporters/badge.svg?branch=master&service=github)](https://coveralls.io/github/YOU54F/cypress-multi-reporters?branch=master)
[![Dependency Status](https://img.shields.io/david/you54f/cypress-multi-reporters.svg?style=flat-square)](https://david-dm.org/you54f/cypress-multi-reporters)
[![devDependency Status](https://img.shields.io/david/dev/you54f/cypress-multi-reporters.svg?style=flat-square)](https://david-dm.org/you54f/cypress-multi-reporters#info=devDependencies)


## Install

```
npm install cypress-multi-reporters --save-dev
```

## Demo
https://github.com/stanleyhlng/mocha-multi-reporters-demo

## Usage

### Basic

```bash
$ ./node_modules/.bin/mocha --reporter cypress-multi-reporters
  mocha-test #1
    ✓ sample test #1.1
    ✓ sample test #1.2

  mocha-test #2
    ✓ sample test #2.1
    - sample test #2.2


  3 passing (6ms)
  1 pending

<testsuite name="Mocha Tests" tests="4" failures="0" errors="0" skipped="1" timestamp="Sun, 03 Jan 2016 08:15:14 GMT" time="0.005">
<testcase classname="mocha-test #1" name="sample test #1.1" time="0"/>
<testcase classname="mocha-test #1" name="sample test #1.2" time="0"/>
<testcase classname="mocha-test #2" name="sample test #2.1" time="0"/>
<testcase classname="mocha-test #2" name="sample test #2.2" time="0"><skipped/></testcase>
</testsuite>
```

### Configuring reporters

Set the reporters configuration using `--reporter-options configFile=config.json`.
- Include reporters in `reporterEnabled` as a comma-delimited list
  ```js
  {
      "reporterEnabled": "spec, @my-org/custom"
  }
  ```
- Specify each reporter's configuration using its camel-cased name, followed by `reporterOptions`, as key.
  > For scoped reporters such as example @myorg/custom, remove all special characters.
  ```js
  {
      "reporterEnabled": "spec, @my-org/custom",
      "myOrgCustomReporterOptions": {
          // [...]
      }
  }
  ```
- You can also use a `.js` file to use Javascript logic to configure the reporters. 
Ex:
  ```js
  // Set the reporters configuration using `--reporter-options configFile=reporterConfig.js`.

  // In reporterConfig.js
  const locale = process.env.SITE_LOCALE;

  module.exports = {
    "reporterEnabled": "mochawesome, mocha-junit-reporter",
    "mochawesomeReporterOptions": {
	    "reportDir": `.reports/${locale}`
    },
    "mochaJunitReporterReporterOptions": {
	    "mochaFile": `./junit/${locale}/[hash].xml`
  };
  ```


  This is useful, for example, if you need to run CI jobs on multiple sites using a script like:
  ```bash
    #!/bin/bash
    # By default run on all sites but you can pass paramenters to run on other sites
    args="$@"
    allsites="US UK AU"
    sites=${args:-$allsites}

    echo "Will run on $sites"

    success=0
    for site in $sites
    do
        echo "Running on $site"
        export SITE_LOCALE="$site"
        npx cypress run --reporter-options configFile=reporterConfig.js
        ret_code=$?
        if [ $ret_code -ne 0 ]; then
             echo "Run for $site - Exited with an ERROR: $ret_code"
            success=$ret_code
        fi
    done
    echo "All sites finished running. Exiting with $success"
    exit $success
  ```

#### Examples:

* Generate `spec` and `json` reports.

```js
// File: config.json
{
    "reporterEnabled": "spec, json"
}
```

```bash
$ ./node_modules/.bin/mocha --reporter cypress-multi-reporters --reporter-options configFile=config.json
  mocha-test #1
    ✓ sample test #1.1
    ✓ sample test #1.2

  mocha-test #2
    ✓ sample test #2.1
    - sample test #2.2


  3 passing (6ms)
  1 pending

{
  "stats": {
    "suites": 2,
    "tests": 4,
    "passes": 3,
    "pending": 1,
    "failures": 0,
    "start": "2015-12-30T22:49:39.713Z",
    "end": "2015-12-30T22:49:39.717Z",
    "duration": 4
  },
  "tests": [
    {
      "title": "sample test #1.1",
      "fullTitle": "mocha-test #1 sample test #1.1",
      "duration": 1,
      "err": {}
    },
    {
      "title": "sample test #1.2",
      "fullTitle": "mocha-test #1 sample test #1.2",
      "duration": 0,
      "err": {}
    },
    {
      "title": "sample test #2.1",
      "fullTitle": "mocha-test #2 sample test #2.1",
      "duration": 0,
      "err": {}
    },
    {
      "title": "sample test #2.2",
      "fullTitle": "mocha-test #2 sample test #2.2",
      "err": {}
    }
  ],
  "pending": [
    {
      "title": "sample test #2.2",
      "fullTitle": "mocha-test #2 sample test #2.2",
      "err": {}
    }
  ],
  "failures": [],
  "passes": [
    {
      "title": "sample test #1.1",
      "fullTitle": "mocha-test #1 sample test #1.1",
      "duration": 1,
      "err": {}
    },
    {
      "title": "sample test #1.2",
      "fullTitle": "mocha-test #1 sample test #1.2",
      "duration": 0,
      "err": {}
    },
    {
      "title": "sample test #2.1",
      "fullTitle": "mocha-test #2 sample test #2.1",
      "duration": 0,
      "err": {}
    }
  ]
}%
```

* Generate `tap` and `xunit` reports.

```js
// File: config.json
{
    "reporterEnabled": "tap, xunit",
    "xunitReporterOptions": {
        "output": "xunit-custom.xml"
    }
}
```
```bash
$ ./node_modules/.bin/mocha --reporter cypress-multi-reporters --reporter-options configFile=config.json

1..4
ok 1 mocha-test 1 sample test 1.1
ok 2 mocha-test 1 sample test 1.2
ok 3 mocha-test 2 sample test 2.1
ok 4 mocha-test 2 sample test 2.2 # SKIP -
# tests 3
# pass 3
# fail 0

$ cat xunit-custom.xml
<testsuite name="Mocha Tests" tests="4" failures="0" errors="0" skipped="1" timestamp="Sun, 03 Jan 2016 08:02:24 GMT" time="0.006">
<testcase classname="mocha-test #1" name="sample test #1.1" time="0.001"/>
<testcase classname="mocha-test #1" name="sample test #1.2" time="0.001"/>
<testcase classname="mocha-test #2" name="sample test #2.1" time="0"/>
<testcase classname="mocha-test #2" name="sample test #2.2" time="0"><skipped/></testcase>
</testsuite>
```

* Generate `tap` and `junit` reports.

To generate `junit` report, we are using [mocha-junit-reporter](https://www.npmjs.com/package/mocha-junit-reporter).

```bash
$ npm install mocha-junit-reporter
```
```js
// File: config.json
{
    "reporterEnabled": "mocha-junit-reporter",
    "mochaJunitReporterReporterOptions": {
	    "mochaFile": "junit-custom.xml"
    }
}
```
```bash
$ ./node_modules/.bin/mocha --reporter cypress-multi-reporters --reporter-options configFile=config.json

1..4
ok 1 mocha-test 1 sample test 1.1
ok 2 mocha-test 1 sample test 1.2
ok 3 mocha-test 2 sample test 2.1
ok 4 mocha-test 2 sample test 2.2 # SKIP -
# tests 3
# pass 3
# fail 0

$ cat xunit-custom.xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Mocha Tests" time="0.001" tests="4" failures="0" skipped="1">
  <testsuite name="Root Suite" timestamp="2016-10-30T02:27:54" tests="0" failures="0" time="0">
  </testsuite>
  <testsuite name="mocha-test #1" timestamp="2016-10-30T02:27:54" tests="2" failures="0" time="0.001">
    <testcase name="mocha-test #1 sample test #1.1" time="0.001" classname="sample test #1.1">
    </testcase>
    <testcase name="mocha-test #1 sample test #1.2" time="0" classname="sample test #1.2">
    </testcase>
  </testsuite>
  <testsuite name="mocha-test #2" timestamp="2016-10-30T02:27:54" tests="2" failures="0" time="0">
    <testcase name="mocha-test #2 sample test #2.1" time="0" classname="sample test #2.1">
    </testcase>
  </testsuite>
</testsuites>
```

### `cmrOutput` option

This option lets you dynamically replace the output files of reporter options.

In your Mocha `--reporterOptions`, specify `cmrOutput` with a plug-sign-separated
list of the reporter name, the property on that reporter's options to have replaced, and the dynamic ID you would like substituted. If you need multiple reporters
to have dynamic output, add additional plus-sign-separated lists separated by colons.

```sh
mocha --reporter cypress-multi-reporters --reporterOptions configFile=cypress-multi-reporters.json,cmrOutput=@mochajs/json-file-reporter+output+specialID tests
```

```js
// cypress-multi-reporters.json
{
  "mochajsJsonFileReporterReporterOptions": {
    "output": "tests/results/file-{id}.json"
  },
  "reporterEnabled": "spec, @mochajs/json-file-reporter"
}
```

This will produce an `output` for `@mochajs/json-file-reporter`
`reporterOptions` with the value:

> tests/results/file-specialID.json

### Programmatic

Note that when Mocha is called programmatically, it is passed an options object when created.  This object is usually derived from a config file that your mocha test runner reads prior to instantiation.  This is the object that must contain a key `reporter` with a value of `cypress-multi-reporters` for this plugin to be used.  You can also pass the key `reporterOptions` with a value of any of the above listed config files (including the `reporterEnabled` subkey and any other plugin configuration information.)  This removes the requirement to have an intermediate configuration file specifically for the multireporter configuration.

```js
const mocha = new Mocha({
      reporter: "cypress-multi-reporters",
      timeout: config.testTimeout || 60000,
      slow: config.slow || 10000,
      reporterOptions: {
          "reporterEnabled": "mocha-junit-reporter, tap",
          "mochaJunitReporterReporterOptions": {
              "mochaFile": "junit-custom.xml"
          }
      }
    });
    mocha.addFile(...)
    mocha.run(...)

```
Note that it will first check if reporterOptions contains a `configFile` key, and if it does, use that.  That key must not exist in the `reporterOptions` object in order to pass these values in directly.

## License

The MIT License (MIT)

Copyright(c) 2019 Yousaf Nabi
Copyright(c) 2017 Stanley Ng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
