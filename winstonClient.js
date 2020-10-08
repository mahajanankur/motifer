// const winston = require('winston');
const httpContext = require('express-http-context');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;
const supportedLevels = ["debug", "info", "warn", "error"];
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
        frequency: options.frequency || '1d',
        dirname: options.dirname || '.'
    });

    return transport;
}

exports.winstonLoggerClient = (level, options) => {
    // level = level ? level : "info";
    if (level) {
        level = supportedLevels.includes(level.toLocaleLowerCase()) ? level.toLocaleLowerCase() : defaultLevel;
    } else {
        level = defaultLevel;
    }
    let logger = null;
    if (options && options.filename) {
        if (options.rotate) {
            logger = createLogger({
                format: combine(
                    timestamp(),
                    customFormat
                ),
                levels: loggingLevels,
                transports: [
                    new transports.Console({ level }),
                    fileRotation(options)
                ]
            });
        } else {
            let path = '';
            if (options.dirname) {
                path = options.dirname + "/" + options.filename;
            } else {
                path = options.filename;
            }
            logger = createLogger({
                format: combine(
                    timestamp(),
                    customFormat
                ),
                levels: loggingLevels,
                transports: [
                    new transports.Console({ level }),
                    new transports.File({ filename: path, level: level })
                ]
            });
        }
    } else {
        logger = createLogger({
            format: combine(
                timestamp(),
                customFormat
            ),
            levels: loggingLevels,
            transports: [
                new transports.Console({ level })]
        });
    }

    return logger;
}