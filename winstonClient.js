// const winston = require('winston');
const httpContext = require('express-http-context');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;
const supportedLevels = ["debug", "info", "warn", "error"];
const defaultLevel = "info";
const REQUEST_ID = "requestId"

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

exports.winstonLoggerClient = (level, path) => {
    // level = level ? level : "info";
    if (level) {
        level = supportedLevels.includes(level.toLocaleLowerCase()) ? level.toLocaleLowerCase() : defaultLevel;
    } else {
        level = defaultLevel;
    }
    let logger = null;
    if (path) {
        logger = createLogger({
            format: combine(
                timestamp(),
                customFormat
            ),
            transports: [
                new transports.Console({ level }),
                new transports.File({ filename: path, level: level })
            ]
        });
    } else {
        logger = createLogger({
            format: combine(
                timestamp(),
                customFormat
            ),
            transports: [
                new transports.Console({ level })]
        });
    }

    return logger;
}