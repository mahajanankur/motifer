// const winston = require('winston');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;
const supportedLevels = ["debug", "info", "warn", "error"];
const defaultLevel = "info";

const customFormat = printf(info => {
    if (info.args) {
        return `${info.timestamp} [${info.filename}] [${info.label.toUpperCase()}] [${info.level.toUpperCase()}] [${JSON.stringify(info.args)}] ${info.message}`;
    } else {
        return `${info.timestamp} [${info.filename}] [${info.label.toUpperCase()}] [${info.level.toUpperCase()}] [null] ${info.message}`;
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