const { winstonLoggerClient } = require('./winstonClient');
const httpContext = require('express-http-context');
const uuid = require('uuid');
const morgan = require('morgan');
// const morganFormat = "combined";
const apiLogLevel = "INFO";
const IS_EXPRESS = true;

let logger = null;
let serviceName = null;
let expressApp = null;

let LoggerObject = function (level, message, args, filename, isExpress) {
    this.level = level;
    this.label = serviceName;
    this.message = message;
    this.args = args;
    this.filename = filename;
    // this.functionName = functionName;
    this.isExpress = isExpress;
    if (logger) {
        logger.log(this);
    } else {
        throw new Error("Not able to initialize the logger object.");
    }

}

/** 
* @author Ankur Mahajan
* @class LoggerBuilder
* @summary This is a LoggerBuilder, builder of logger object.
* @param {string} filename filename with path.
*/
const LoggerBuilder = function (filename, isExpress) {
    let level;
    let message;
    let args;
    return {
        info: function (msg) {
            this.level = "info";
            this.message = msg;
            return this.build();
        },
        debug: function (msg) {
            this.level = "debug";
            this.message = msg;
            return this.build();
        },
        error: function (msg) {
            this.level = "error";
            this.message = msg;
            return this.build();
        },
        warn: function (msg) {
            this.level = "warn";
            this.message = msg;
            return this.build();
        },
        // @depricated
        // arguments: function (arguments) {
        //     this.args = arguments;
        //     return this;
        // },
        build: function () {
            // TODO - Find the efficient approach - This is not working for ES6.
            // let functionName = this.build.caller.name;
            // let customLogger = new LoggerObject(this.level, this.message, this.args, filename, functionName, isExpress);
            let customLogger = new LoggerObject(this.level, this.message, this.args, filename, isExpress);
            // this.arguments(null);
            return customLogger;
        }
    };
};

/**
 * @author Ankur Mahajan
 * @class LoggerFactory
 * @summary This is a LoggerFactory, an entry point to the logger module.
 * @param {string} service service name.
 * @param {string} level log level i.e info, error, warn and debug.
 * @param {string} path logfile name with path.
 * @returns {LoggerBuilder} LoggerBuilder 
 */
const LoggerFactory = function (service, level, path) {
    serviceName = service;
    this.path = path;
    this.level = level;
    // if (!logger) {
    // initialize the winson logger.
    logger = winstonLoggerClient(level, path);
    // }
    return {
        getLogger: (filename) => {
            filename = filename.replace(/^.*[\\\/]/, '');
            return new LoggerBuilder(filename);
        }
    }
    // return new LoggerBuilder();
}

/**
 * @author Ankur Mahajan
 * @class ExpressLoggerFactory
 * @summary This is an ExpressLoggerFactory, configuration point for Motifer's express logger.
 * @param {string} service service name
 * @param {string} level log level i.e info, error, warn and debug.
 * @param {Object} express instance of express server.
 * @param {string} path logfile name with path.
 * @returns {LoggerBuilder} LoggerBuilder
 */
const ExpressLoggerFactory = function (service, level, express = null, path) {
    serviceName = service;
    this.path = path;
    this.level = level;
    expressApp = express;
    if (express) {
        express.use(httpContext.middleware);
        // Run the context for each request. Assign a unique identifier to each request
        express.use((req, res, next) => {
            let requestId = uuid.v4();
            httpContext.set('requestId', requestId);
            req.id = requestId;
            // Request Logging
            let dto = {
                message: `${new Date().toISOString()} [request] [${requestId}] [${serviceName}] [${apiLogLevel}] [${req.method}] [${req.ip}] [${req.originalUrl}] [${req.body ? JSON.stringify(req.body) : null}]`,
                api: true
            };
            logger.info(dto);
            next();
        });
        // Morgan to track the response.
        // express.use(morgan(':date[iso] :id :http-version :method :referrer :remote-addr :remote-user :req[Auth] :url :status :res[content-length] - :response-time ms :user-agent'));
        express.use(morgan(`:date[iso] [response] [:id] [${serviceName}] [${apiLogLevel}] [:method] [:remote-addr] [:url] [:status] [:res[content-length]] [:response-time ms] [:user-agent]`, { "stream": loggerStream }));
        // express.use(morgan(morganFormat));
    }
    // if (!logger) {
    // initialize the winson logger.
    logger = winstonLoggerClient(level, path);
    // }
    return {
        getLogger: (filename) => {
            filename = filename.replace(/^.*[\\\/]/, '');
            return new LoggerBuilder(filename, true);
        }
    }
    // return new LoggerBuilder();
}

/**
 * @author Ankur Mahajan
 * @class Logger
 * @summary This is a actual logger object that prints the logs in the console and file appenders.
 * @param {string} filename Filename of the javascript file.
 * @param {boolean} isExpress Boolean if using this with express js, default is true.
 * @returns {LoggerBuilder} LoggerBuilder.
 */
// exports.Logger = function (filename, isExpress) {
//     filename = filename.replace(/^.*[\\\/]/, '');
//     return new LoggerBuilder(filename, (isExpress != undefined && typeof isExpress === "boolean") ? isExpress : IS_EXPRESS);
// }

// Custom request Id token for Morgan.
morgan.token('id', function getId(req) {
    return req.id
});

// class LoggerStream {

//     write(message) {
//         let dto = {
//             message,
//             api: true
//         };
//         logger.info(dto);
//         // new LoggerObject("info", message);
//     }
// }

const loggerStream = {
    write: (message) => {
        message = message.substring(0,message.lastIndexOf('\n'));
        let dto = { message, api: true };
        logger.info(dto);
    }
}

class Logger {
    /**
     * @author Ankur Mahajan
     * @class Logger
     * @summary This is a actual logger object that prints the logs in the console and file appenders.
     * @param {string} filename Filename of the javascript file.
     * @param {boolean} isExpress Boolean if using this with express js, default is true.
     * @returns {LoggerBuilder} LoggerBuilder.
     */
    static getLogger(filename, isExpress) {
        filename = filename.replace(/^.*[\\\/]/, '');
        return new LoggerBuilder(filename, (isExpress != undefined && typeof isExpress === "boolean") ? isExpress : IS_EXPRESS);
    }
}

module.exports = {
    LoggerFactory,
    ExpressLoggerFactory,
    Logger
}