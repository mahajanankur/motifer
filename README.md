# Motifer

[![Version npm](https://img.shields.io/npm/v/motifer.svg?style=flat-square)](https://www.npmjs.com/package/motifer)

[![NPM](https://nodei.co/npm/motifer.png?downloads=true&downloadRank=true)](https://nodei.co/npm/motifer/)

Motifer is a generic logs pattern manager build on top of Winston. It covers multiple usecases as follows.

  - Log pattern validation.
  - Consistent log pattern across the application.
  - ELK and Cloudtrail support.
  - Express logger with an unique request id for a request flow.

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
The recommended way to use `motifer` is to create a logger. The simplest way to do this is using `LoggerFactory` or `ExpressLoggerFactory`.
### LoggerFactory
Initialize the `LoggerFactory` object once and use it in different js files.
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
2020-08-31T09:45:53.717Z [filename.js] [functionName] [APPNAME] [INFO] [null] The sample info message.
2020-08-31T09:45:53.720Z [filename.js] [functionName] [APPNAME] [DEBUG] [{"key1":"value1","key2":"value2"}] The sample debug message.
2020-08-31T09:45:53.720Z [filename.js] [functionName] [APPNAME] [ERROR] [{"key1":"value1","key2":"value2"}] Error: Sample Error Message
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
2020-08-31T09:45:53.720Z [filename.js] [functionName] [APPNAME] [ERROR] [null] Error: Sample Error Message
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
### ExpressLoggerFactory
Initialize the `ExpressLoggerFactory` object once with express server object and use it in different routes.
``` js
const express = require("express");
const bodyParser = require("body-parser");
const { ExpressLoggerFactory } = require("motifer");
// Change this Object according to your route.
const route = require("./src/controllers/route");
const port = 8080;

//Configure the server
const server = express();

//Configure the JSON body parser for request.
server.use(bodyParser.json());

// Motifer - This is a mandatory initialization to send the express object to 
// the motifer scope. If this configuration not set, it will not print the requestId. 
const Logger = new ExpressLoggerFactory("app", "debug", server, "app.log");
const logger = Logger.getLogger(__filename);

//Server port configuration.
server.listen(port, () => {
    logger.info(`Motifer node server is running on port: ${port}`).build();
});

//Register the controllers as routers.
server.use("/api", route);
```


``` js
const express = require("express");
const { Logger } = require("motifer");
//ExpressLoggerFactory should be initialized before using this in index.js.
const logger = Logger(__filename);
//Get router from express
const router = express.Router();

//Resources
router.get("/status", async (req, res, next) => {
    logger.info("Service status request.").arguments(req.body).build();
    logger.debug("Service is up.").build();
    return res.json({message: "Service is running!!"});
});

module.exports = router;
```
> Request id is of `UUID V4` type.

``` log
2020-08-31T09:45:53.717Z [requestId] [filename.js] [functionName] [APPNAME] [INFO] [null] The sample info message.
2020-08-31T09:45:53.720Z [40ee9106-e188-4db3-b3d9-b59ffc5195a1] [filename.js] [functionName] [APPNAME] [DEBUG] [{"key1":"value1","key2":"value2"}] The sample debug message.
2020-08-31T09:45:53.720Z [requestID] [filename.js] [functionName] [APPNAME] [ERROR] [{"key1":"value1","key2":"value2"}] Error: Sample Error Message
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
2020-08-31T09:45:53.720Z [requestID] [filename.js] [functionName] [APPNAME] [ERROR] [null] Error: Sample Error Message
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

### ExpressLoggerFactory

The **object** has four parameter.

| Param | Description |Mandatory |Default |Comments|
| ------ | ------ | ------ | ------ | ------ |
| service | Application or service name. | Yes | NA| This is a mandatory param.|
| level | Log level for the application. | Yes | NA| This is a mandatory param.|
| express | Express object | Yes | NA| This is a mandatory param.|
| path | Path of logfile with filename. | No | null| If not supplied file appender will not be attached.|

License
----

**Apache 2.0**


**Free Software, Hell Yeah!**
