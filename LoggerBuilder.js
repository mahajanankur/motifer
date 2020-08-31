const { winstonLoggerClient } = require('./winstonClient');

let logger = null;

let Logger = function (level, label, message, args, filename) {
    // console.log(`Logger: object`, logger);
    this.level = level;
    this.label = label;
    this.message = message;
    this.args = args;
    this.filename = filename;
    // TODO FACTORY Pattern
    if (logger) {
        switch (level) {
            case "info":
                logger.info(this);
                break;
            case "error":
                logger.error(this);
                break;
            case "warn":
                logger.warn(this);
                break;
            default:
                logger.debug(this);
                break;
        }
    } else {
        // console.log(`Logger:NullPointerException: Not able to initialize the logger object.`);
        throw new Error("Not able to initialize the logger object.");
    }

}

/** 
* @author Ankur Mahajan
* @class LoggerBuilder
* @summary This is a LoggerBuilder, builder of logger object.
* @function setLevel @param {string} level log level i.e INFO, ERROR, WARN and DEBUG.
*/
const LoggerBuilder = function () {
    let level = null;
    let service = null;
    let message = null;
    let args = null;
    let filename = null;
    return {
        setLevel: function (leveldto) {
            // Validation
            level = leveldto;
            return this;
        },
        setService: function (servicedto) {
            service = servicedto;
            return this;
        },
        setMessage: function (messagedto) {
            message = messagedto;
            return this;
        },
        setArguments: function (arguments) {
            args = arguments;
            return this;
        },
        setFilename: function (filenamedto) {
            filename = filenamedto;
            return this;
        },
        build: function () {
            return new Logger(level, service, message, args, filename);
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
    // console.log(`LoggerFactory`, service, path);
    this.service = service;
    this.path = path;
    // this.level = level;
    // if (!logger) {
    // initialize the winson logger.
    logger = winstonLoggerClient(path, level);
    // }
    // console.log(`LoggerFactory: Winston Logger Object`, logger);
    return new LoggerBuilder().setService(service);
}