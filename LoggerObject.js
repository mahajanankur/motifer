// const { winstonLoggerClient } = require('./winstonClient');
// const httpContext = require('express-http-context');
// const uuid = require('uuid');
'stict mode'
let logger = null;

class LoggerObject {
    constructor(level, message, args, filename, functionName, isExpress) {
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

    static getWinstonClient() {
        
    }

}

module.exports = LoggerObject;