# Motifer

[![Version npm](https://img.shields.io/npm/v/motifer.svg?style=flat-square)](https://www.npmjs.com/package/motifer)

[![NPM](https://nodei.co/npm/motifer.png?downloads=true&downloadRank=true)](https://nodei.co/npm/motifer/)

Motifer is a generic logs pattern manager build on top of Winston. It covers multiple usecases as follows.

  - Log pattern validation.
  - Consistent log pattern across the application.
  - Logstash and Cloudtrail support.
  - Request and response logging with a **unique request id** for a request flow.

### Overview

Motifer uses a number of open source projects to work properly:

* [Winston](https://github.com/winstonjs/winston)
* [Morgan](https://github.com/expressjs/morgan)

And of course Motifer itself is open source with a public [repository](https://github.com/mahajanankur/motifer) on GitHub.

### Installation

Motifer requires [Node.js](https://nodejs.org/) to run.

Install the dependencies and devDependencies and start the server.

```sh
$ npm i motifer
```
---
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
        logger.info(`The message to print ${args.subargs}`);
}
```
``` log
2020-08-31T09:45:53.717Z [APP_NAME] [INFO] [filename.js] The sample info message.
2020-08-31T09:45:53.720Z [APP_NAME] [DEBUG] [filename.js] The sample debug message. The arguments are {"key1":"value1","key2":"value2"}.
2020-08-31T09:45:53.721Z [APP_NAME] [WARN] [filename.js] The sample warn message.
2020-08-31T09:45:53.722Z [APP_NAME] [ERROR] [filename.js] Error: Sample Error Message with arguments {"key1":"value1"}
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
2020-08-31T09:45:53.723Z [APP_NAME] [ERROR] [filename.js] Error: Sample Error Message
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
---
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
    logger.info(`Motifer node server is running on port: ${port}`);
});

//Register the controllers as routers.
server.use("/api", route);
```


``` js
const express = require("express");
const { Logger } = require("motifer");
//ExpressLoggerFactory should be initialized before using this in index.js.
const logger = Logger.getLogger(__filename);
//Get router from express
const router = express.Router();

//Resources
router.get("/status", async (req, res, next) => {
    logger.info("Service status request.");
    logger.debug("Service is up, sample debug log.");
    logger.warn("Warning the parameter is null, sample warn log.");
    logger.error("Exception is thrown, sample error log.");
    return res.json({message: "Service is running!!"});
});

module.exports = router;
```
> Request id is of `UUID V4` type.

#### Log Patterns
##### Request Logs
``` log
TIMESTAMP_ISO [request] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [REQUEST_METHOD] [REQUEST_IP] [API_PATH] [BODY]
```
##### Service Logs
``` log
TIMESTAMP_ISO [service] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [FILENAME] MULTI_OR_SINGLE_LINE_MESSAGE
```
##### Response Logs
``` log
TIMESTAMP_ISO [response] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [REQUEST_METHOD] [REQUEST_IP] [API_PATH] [RESPONSE_STATUS] [CONTENT_LENGTH] [RESPONSE_TIME] [USER_AGENT] 
```

``` log
2020-09-13T15:39:26.320Z [request] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [INFO] [GET] [::1] [/api/status/10?service=myservice&cc=IND] [{}]
2020-09-13T15:39:26.325Z [service] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [INFO] [status.js] Some sample messages to print.
2020-09-13T15:39:26.325Z [service] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [DEBUG] [status.service.js] Publishing data to channel with topic: sampleTopic.
2020-09-13T15:39:26.326Z [service] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [ERROR] [status.service.js] Error: Runtime Exception
    at exports.checkStatus (/motifer/rest/src/services/status.service.js:8:18)
    at router.get (/motifer/rest/src/controllers/status.js:15:5)
    at Layer.handle [as handle_request] (/motifer/rest/node_modules/express/lib/router/layer.js:95:5)
    at next (/motifer/rest/node_modules/express/lib/router/route.js:137:13)
    at Route.dispatch (/motifer/rest/node_modules/express/lib/router/route.js:112:3)
    at Layer.handle [as handle_request] (/motifer/rest/node_modules/express/lib/router/layer.js:95:5)
    at /motifer/rest/node_modules/express/lib/router/index.js:281:22
    at param (/motifer/rest/node_modules/express/lib/router/index.js:354:14)
    at param (/motifer/rest/node_modules/express/lib/router/index.js:365:14)
    at Function.process_params (/motifer/rest/node_modules/express/lib/router/index.js:410:3)
2020-09-13T15:39:26.326Z [service] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [WARN] [status.js] Service status request.
2020-09-13T15:39:26.331Z [response] [47de6d41-6dbd-44fc-9732-e28823755b58] [APP_NAME] [INFO] [GET] [::1] [/api/status/10?service=search&cc=IND] [304] [10] [6.018 ms] [Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36]
2020-09-13T15:39:26.815Z [request] [bcf6d2e2-f8c9-49ee-9efa-65fb15d8b11e] [APP_NAME] [INFO] [GET] [::1] [/favicon.ico] [{}]
2020-09-13T15:39:26.817Z [response] [bcf6d2e2-f8c9-49ee-9efa-65fb15d8b11e] [APP_NAME] [INFO] [GET] [::1] [/favicon.ico] [404] [150] [1.880 ms] [Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36]
```
---
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
