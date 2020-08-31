# Motifer

[![Version](https://img.shields.io/npm/v/npm-link-up.svg?colorB=green)](https://www.npmjs.com/package/motifer)

Motifer is a generic logs pattern manager build on top of Winston. It covers multiple usecases as follows.

  - Log pattern validation.
  - Consistent log pattern across the application.
  - ELK and Cloudtrail support.

### Overview

Motifer uses a number of open source projects to work properly:

* [Winston](https://github.com/winstonjs/winston)

And of course Motifer itself is open source with a public [repository](https://github.com/mahajanankur/motifer) on GitHub.

### Installation

Motider requires [Node.js](https://nodejs.org/) to run.

Install the dependencies and devDependencies and start the server.

```sh
$ npm i motifer
```

## Usage
The recommended way to use `motifer` is to create a logger. The simplest way to do this is using `LoggerFactory`.

Initialize the LoggerFactory object once and use it in different js files.
``` js
const { LoggerFactory } = require('motifer');

exports.logger = new LoggerFactory("app_name", "logfile.log", "log_level");
```
``` js
const { logger } = require('./index');
logger.setFilename(__filename);

const printLogs = args => {
        logger
            .setLevel("info")
            .setMessage(`The message to print ${args.subargs}`)
            .setArguments(args)
            .build();
    });
}
```
``` log
2020-08-31T09:45:53.717Z [filename.js] [APPNAME] INFO: The sample info message
2020-08-31T09:45:53.720Z [filename.js] [APPNAME] DEBUG: The sample info message | {"key1":"value1","key2":"value2"}
2020-08-31T09:45:53.720Z [filename.js] [APPNAME] ERROR: The sample error message | {"key1":"value1","key2":"value2"}
```

### LoggerFactory

The **object** has three parameter.

| Param | Description |Mandatory
| ------ | ------ | ------ |
| service | Application or service name. | Yes |
| path | Path of logfile with filename. | Yes |
| level | Default log level for the application. | Yes |


License
----

**Apache 2.0**


**Free Software, Hell Yeah!**
