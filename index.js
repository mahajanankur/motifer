const { winstonLoggerClient } = require('./winstonClient');

let logger = null;
let serviceName = null;

let Logger = function (level, message, args, filename) {
    this.level = level;
    this.label = serviceName;
    this.message = message;
    this.args = args;
    this.filename = filename;
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
const LoggerBuilder = function (filename) {
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
            let customLogger = new Logger(this.level, this.message, this.args, filename);
            this.arguments(null);
            return customLogger;
        }
    };
};

/**
 * @author Ankur Mahajan
 * @class LoggerFactory
 * @summary This is a LoggerFactory, an entry point to the logger module.
 * @param {string} service microservice name
 * @param {string} path logfile name with path
 * @param {string} level log level i.e info, error, warn and debug.
 * @returns LoggerBuilder
 */
exports.LoggerFactory = function (service, path, level) {
    serviceName = service;
    this.path = path;
    this.level = level;
    // if (!logger) {
    // initialize the winson logger.
    logger = winstonLoggerClient(path, level);
    // }
    return {
        getLogger: (filename) => {
            return new LoggerBuilder(filename);
        }
    }
    // return new LoggerBuilder();
}