// const winston = require('winston');
const httpContext = require('express-http-context');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;
// const supportedLevels = ["debug", "info", "warn", "error"];
const defaultLevel = "info";
const REQUEST_ID = "requestId";
const DailyRotateFile = require('winston-daily-rotate-file');

const loggingLevels = {
    crawlerror: -5,
    crawlui: -5,
    crawlinfo: -4,
    sualert: -3,
    crawlalert: -2,
    usersessionactivity: -1,
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

const maskedLevels = {
    crawlinfo: 'INFO',
    crawlerror: 'ERROR'
};

const customFormat = printf(info => {
    let requestId = httpContext.get(REQUEST_ID);
    if (info.api) {
        return `${info.message}`;
    } else {
        if (info.isExpress) {
            // [${info.args ? JSON.stringify(info.args) : null}]
            if (['crawlerror', 'crawlinfo'].includes(info.level)) {
                return `${info.timestamp} [${maskedLevels[info.level]}] ${info.message}`;
            }
            if (info.level === 'crawlui') {
                return `${info.message}`;
            }
            if (info.level === 'usersessionactivity') {
                return `${info.timestamp} [service] [${requestId ? requestId : null}] [${info.label}] [${info.level.toUpperCase()}] ${info.message}`;
            }
            if (info.level === 'crawlalert' || info.level === 'sualert') {
                return `${info.timestamp} [service] [${info.label}] [${info.level.toUpperCase()}] [${info.filename}] ${info.message}`;
            }
            return `${info.timestamp} [service] [${requestId ? requestId : null}] [${info.label}] [${info.level.toUpperCase()}] [${info.filename}] ${info.message}`;
        } else {
            if (['crawlerror', 'crawlinfo'].includes(info.level)) {
                return `${info.timestamp} [${maskedLevels[info.level]}] ${info.message}`;
            }
            if (info.level === 'crawlui') {
                return `${info.message}`;
            }
            if (info.level === 'usersessionactivity') {
                return `${info.timestamp} [service] [${requestId ? requestId : null}] [${info.label}] [${info.level.toUpperCase()}] ${info.message}`;
            }
            if (info.level === 'crawlalert' || info.level === 'sualert') {
                return `${info.timestamp} [service] [${info.label}] [${info.level.toUpperCase()}] [${info.filename}] ${info.message}`;
            }
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
        dirname: options.dirname || '.',
        level: options.level
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
    transporters.push(new transports.Console({ level: logLevel }));

    if (options && options instanceof Array) {
        options.forEach(element => {
            // validation check on filename.
            if (!element.filename) {
                throw new Error("filename is null.");
            }
            logLevel = verifyLogLevel(element.level);
            // check if rotation is enabled
            if (element.rotate) {
                let transport = fileRotation(element);
                transporters.push(transport);
            } else {
                let path = element.filename;
                if (element.dirname) {
                    path = element.dirname + "/" + element.filename;
                }
                let transport = new transports.File({ filename: path, level: logLevel });
                transporters.push(transport);
            }
        });
    } else if (options && !(options instanceof Array)) {
        throw new Error("Options should be an array.");
    }
    return transporters;
}

const verifyLogLevel = (level) => {
    let logLevel = defaultLevel;
    if (level) {
        level = level.toLowerCase();
        logLevel = loggingLevels[level] || level == 'error' ? level : defaultLevel;
    }
    return logLevel;
}
