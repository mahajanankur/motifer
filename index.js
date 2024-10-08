// Add this polyfill at the top of your main file
// Partial Fix of https://github.com/winstonjs/winston-transport/issues/247
if (typeof globalThis === 'undefined') {
    global.globalThis = global;
}

const { winstonLoggerClient } = require('./winstonClient');
const httpContext = require('express-http-context');
const uuid = require('uuid');
const morgan = require('morgan');
const Joi = require('joi');
const util = require('util');
// const morganFormat = "combined";
const apiLogLevel = "INFO";
const defaultLevel = "info";
const IS_EXPRESS = true;
const validLogLevels = ["crawlerror", "crawlui", "crawlinfo", "error", "warn", "info", "http", "verbose", "debug", "silly", "usersessionactivity"];

let logger = null;
let serviceName = null;
let expressApp = null;
let apmClient = null;

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
    return {
        info: function (...args) {
            this.level = "info";
            this.message = util.format(...args);
            return this.build();
        },
        debug: function (...args) {
            this.level = "debug";
            this.message = util.format(...args);
            return this.build();
        },
        error: function (...args) {
            this.level = "error";
            this.message = util.format(...args);
            if (apmClient) apmClient.captureError(this.message);
            return this.build();
        },
        warn: function (...args) {
            this.level = "warn";
            this.message = util.format(...args);
            return this.build();
        },
        crawlError: function (...args) {
            this.level = "crawlerror";
            this.message = util.format(...args);
            if (apmClient) apmClient.captureError(this.message);
            return this.build();
        },
        crawlInfo: function (...args) {
            this.level = "crawlinfo";
            this.message = util.format(...args);
            return this.build();
        },
        crawlUi: function (...args) {
            this.level = "crawlui";
            this.message = util.format(...args);
            return this.build();
        },
        userSessionActivity: function (...args) {
            this.level = "usersessionactivity";
            this.message = util.format(...args);
            return this.build();
        },
        build: function () {
            let customLogger = new LoggerObject(this.level, this.message, this.args, filename, isExpress);
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
 * @param {object} options file and rotation object.
 * @returns {LoggerBuilder} LoggerBuilder 
 */
const LoggerFactory = function (service, level, options) {
    if (!service) {
        throw new Error("Service name is required.");
    }
    if (level && !validLogLevels.includes(level)) {
        throw new Error(`Invalid log level: ${level}. Supported levels are ${validLogLevels}`);
    }

    serviceName = service;
    this.level = level || defaultLevel;
    this.options = options;
    // initialize the winson logger.
    logger = winstonLoggerClient(level, options);
    return {
        getLogger: (filename) => {
            filename = filename.replace(/^.*[\\\/]/, '');
            return new LoggerBuilder(filename);
        }
    }
}

/**
 * @author Ankur Mahajan
 * @class ExpressLoggerFactory
 * @summary This is an ExpressLoggerFactory, configuration point for Motifer's express logger.
 * @param {string} service service name
 * @param {string} level log level i.e info, error, warn and debug.
 * @param {Object} express instance of express server.
 * @param {object} options file and rotation object.
 * @returns {LoggerBuilder} LoggerBuilder
 */
const ExpressLoggerFactory = function (service, level, express = null, options) {
    if (!service) {
        throw new Error("Service name is required.");
    }
    if (level && !validLogLevels.includes(level)) {
        throw new Error(`Invalid log level: ${level}. Supported levels are ${validLogLevels}`);
    }

    serviceName = service;
    this.options = options;
    expressApp = express;
    this.level = level || defaultLevel;

    if (express) {
        express.use(httpContext.middleware);
        // Run the context for each request. Assign a unique identifier to each request
        express.use((req, res, next) => {
            // Bug fix for requestId gets undefind in some contexts.
            if (!httpContext.ns.active) {
                let context = httpContext.ns.createContext();
                httpContext.ns.context = context;
                httpContext.ns.active = context;

            }
            httpContext.ns.bindEmitter(req);
            httpContext.ns.bindEmitter(res);
            // Enhancement - request id chaining across the microservices.
            let requestId = req.headers['request-id'];
            if (!requestId) {
                requestId = uuid.v4();
                req.headers['request-id'] = requestId;
            }

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
        express.use(morgan(`:date[iso] [response] [:id] [${serviceName}] [${apiLogLevel}] [:method] [:remote-addr] [:url] [:status] [:res[content-length]] [:response-time] [:user-agent]`, { "stream": loggerStream }));
    }
    // initialize the winson logger.
    logger = winstonLoggerClient(level, options);
    // }
    return {
        getLogger: (filename) => {
            filename = filename.replace(/^.*[\\\/]/, '');
            return new LoggerBuilder(filename, true);
        }
    }
}

/**
 * @author Mohan Rana
 * @class ApmFactory
 * @summary This is an ApmFactory, used to integrate with elastic APM. Need to use this factory at very first line in the application.
 * @param configObject.serviceName Your application name.
 * @param configObject.apmServerUrl APM server url.
 * @param configObject.secretToken APM secret token.
 * @param configObject.logLevel APM log level, default value 'error'.
 * @param configObject.environment Your application instance, default value 'production'.
 */

const ApmFactory = function (configObject) {
    const isValid = validateParameters(configObject);
    if (isValid.error) throw new Error(isValid.error.message);
    const parameters = isValid.value;
    apmClient = require('elastic-apm-node').start({
        serviceName: parameters.serviceName,
        serverUrl: parameters.apmServerUrl,
        secretToken: parameters.secretToken,
        logLevel: parameters.logLevel || 'error',
        environment: parameters.environment || 'production',
        transactionIgnoreUrls: parameters.transactionIgnoreUrls || [],
        usePathAsTransactionName: false
    });
    return apmClient;
}

const validateParameters = (options) => {
    const schema = Joi.object().keys({
        serviceName: Joi.string().required(),
        apmServerUrl: Joi.string().uri().required(),
        secretToken: Joi.string().required(),
        transactionIgnoreUrls: Joi.array()
    }).unknown(true);
    const result = schema.validate(options);
    return result;
}

// Custom request Id token for Morgan.
morgan.token('id', function getId(req) {
    return req.id
});

const loggerStream = {
    write: (message) => {
        message = message.substring(0, message.lastIndexOf('\n'));
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
    Logger,
    ApmFactory
}