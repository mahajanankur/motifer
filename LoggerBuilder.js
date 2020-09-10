// const { winstonLoggerClient } = require('./winstonClient');
// const httpContext = require('express-http-context');
// const uuid = require('uuid');
'stict mode'

class LoggerBuilder {
    constructor(filename, isExpress) {
        console.log(`In constructor`, filename, isExpress);
        this.filename = filename;
        this.isExpress = isExpress;
        console.log(`In constructor`, this);
    }

    info(message) {
        console.log(`In info`, message);
        this.level = "info";
        this.message = message;
        console.log(`In info`, this);
        return this;
    }

    debug(message) {
        this.level = "debug";
        this.message = message;
        return this;
    }

    error(message) {
        this.level = "error";
        this.message = message;
        return this;
    }

    warn(message) {
        this.level = "warn";
        this.message = message;
        return this;
    }

    arguments(args) {
        console.log(`In arguments`, args);
        this.args = args;
        console.log(`In arguments`, this);
        return this;
    }

    build() {
        console.log(`In build`);
        // let functionName = this.build.caller.name;
        // let customLogger = new LoggerObject(this.level, this.message, this.args, filename, functionName, isExpress);
        this.arguments(null);
        console.log(`In build`, this);
        // return customLogger;
    }
}

module.exports = LoggerBuilder;