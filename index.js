const { winstonLoggerClient } = require('./winstonClient');
const httpContext = require('express-http-context');
const uuid = require('uuid');

let logger = null;
let serviceName = null;
let expressApp = null;

let LoggerObject = function (level, message, args, filename, functionName, isExpress) {
    this.level = level;
    this.label = serviceName;
    this.message = message;
    this.args = args;
    this.filename = filename;
    this.functionName = functionName;
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
            return this;
        },
        debug: function (msg) {
            this.level = "debug";
            this.message = msg;
            return this;
        },
        error: function (msg) {
            this.level = "error";
            this.message = msg;
            return this;
        },
        warn: function (msg) {
            this.level = "warn";
            this.message = msg;
            return this;
        },
        arguments: function (arguments) {
            this.args = arguments;
            return this;
        },
        build: function () {
            let functionName = this.build.caller.name;
            let customLogger = new LoggerObject(this.level, this.message, this.args, filename, functionName, isExpress);
            this.arguments(null);
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
exports.LoggerFactory = function (service, level, path) {
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
exports.ExpressLoggerFactory = function (service, level, express = null, path) {
    serviceName = service;
    this.path = path;
    this.level = level;
    expressApp = express;
    if (express) {
        express.use(httpContext.middleware);
        // Run the context for each request. Assign a unique identifier to each request
        express.use((req, res, next) => {
            httpContext.set('requestId', uuid.v4());
            next();
        });
    }
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
 * @class Logger
 * @summary This is a actual logger object that prints the logs in the console and file appenders.
 * @param {string} filename Filename of the javascript file.
 * @returns {LoggerBuilder} LoggerBuilder.
 */
exports.Logger = function (filename) {
    filename = filename.replace(/^.*[\\\/]/, '');
    return new LoggerBuilder(filename, expressApp ? true : false);
}

