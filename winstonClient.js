// const winston = require('winston');
const httpContext = require('express-http-context');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;
// const supportedLevels = ["debug", "info", "warn", "error"];
const defaultLevel = "info";
const REQUEST_ID = "requestId";
const DailyRotateFile = require('winston-daily-rotate-file');

const loggingLevels = {
    crawlError: -2,
    crawlInfo: -1,
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

const customFormat = printf(info => {
    let requestId = httpContext.get(REQUEST_ID);
    if (info.api) {
        return `${info.message}`;
    } else {
        if (info.isExpress) {
            // [${info.args ? JSON.stringify(info.args) : null}]
            return `${info.timestamp} [service] [${requestId ? requestId : null}] [${info.label}] [${info.level.toUpperCase()}] [${info.filename}] ${info.message}`;
        } else {
            return `${info.timestamp} [${info.filename}] [${info.label}] [${info.level.toUpperCase()}] [${info.filename}] ${info.message}`;
        }
    }
});

const fileRotation = (options) => {
    let transport = new DailyRotateFile({
        filename: options.filename || 'motifer-%DATE%.log',
        datePattern: options.datePattern || 'YYYY-MM-DD',
        zippedArchive: options.archived || true,
        maxSize: options.maxSize || '20m',
        maxFiles: options.maxFiles || '14d',
        frequency: options.frequency || null,
        dirname: options.dirname || '.'
    });

    return transport;
}

exports.winstonLoggerClient = (level, options) => {
    let logger = createLogger({
        format: combine(
            timestamp(),
            customFormat
        ),
        levels: loggingLevels,
        transports: buildTransports(level, options)
    });

    return logger;
}

const buildTransports = (level, options) => {
    let transporters = [];
    let logLevel = verifyLogLevel(level);
    // default console transports
    transporters.push(new transports.Console({ logLevel }));
    if (options && options.length > 0) {
        options.forEach(element => {
            // validation check on filename.
            if (!element.filename) {
                throw new Error("filename is null.");
            }
            logLevel = verifyLogLevel(element.level);
            // check if rotation is enabled
            if (element.rotate) {
                transporters.push(fileRotation(element));
            } else {
                let path = element.filename;
                if (element.dirname) {
                    path = element.dirname + "/" + element.filename;
                }
                transporters.push(new transports.File({ filename: path, level: logLevel }));
            }

        });
    }
    return transporters;
}

const verifyLogLevel = (level) => {
    let logLevel = defaultLevel;
    if (level) {
        // logLevel = supportedLevels.includes(level.toLocaleLowerCase()) ? level.toLocaleLowerCase() : defaultLevel;
        logLevel = loggingLevels[level] ? level : defaultLevel;
    }
    return logLevel;
}