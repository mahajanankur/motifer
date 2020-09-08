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

exports.Logger = new LoggerFactory("app_name", "log_level", "logfile.log");
```
Supported log levels are **info, debug, warn and error**.

``` js
const { Logger } = require('./index');
let logger = Logger.getLogger(__filename);

const printLogs = args => {
        logger
            .info(`The message to print ${args.subargs}`)
            .arguments(args)
            .build();
}
```
``` log
2020-08-31T09:45:53.717Z [filename.js] [APPNAME] [INFO] [null] The sample info message.
2020-08-31T09:45:53.720Z [filename.js] [APPNAME] [DEBUG] [{"key1":"value1","key2":"value2"}] The sample debug message.
2020-08-31T09:45:53.720Z [filename.js] [APPNAME] [ERROR] [{"key1":"value1","key2":"value2"}] Error: Sample Error Message
    at getTerminatedEmployees (/motifer/examples/service.js:10:20)
    at Object.<anonymous> (motifer/examples/service.js:23:1)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
2020-08-31T09:45:53.720Z [filename.js] [APPNAME] [ERROR] [null] Error: Sample Error Message
    at getTerminatedEmployees (/motifer/examples/service.js:10:20)
    at Object.<anonymous> (motifer/examples/service.js:23:1)
    at Module._compile (internal/modules/cjs/loader.js:778:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
```

### LoggerFactory

The **object** has three parameter.

| Param | Description |Mandatory |Default |Comments|
| ------ | ------ | ------ | ------ | ------ |
| service | Application or service name. | Yes | NA| This is a mandatory param.|
| level | Log level for the application. | No | info| Info is default log level.|
| path | Path of logfile with filename. | No | null| If not supplied file appender will not be attached.|

License
----

**Apache 2.0**


**Free Software, Hell Yeah!**
