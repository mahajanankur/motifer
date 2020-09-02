// const winston = require('winston');
const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, align, colorize } = format;

const customFormat = printf(info => {
    if (info.args) {
        return `${info.timestamp} [${info.filename}] [${info.label.toUpperCase()}] ${info.level.toUpperCase()}: ${info.message} | ${JSON.stringify(info.args)}`;
    } else {
        return `${info.timestamp} [${info.filename}] [${info.label.toUpperCase()}] ${info.level.toUpperCase()}: ${info.message}`;
    }
});

exports.winstonLoggerClient = (path, level) => {
    level = level ? level : "info";
    const logger = createLogger({
        format: combine(
            timestamp(),
            customFormat
        ),
        transports: [
            new transports.Console({ level }),
            new transports.File({ filename: path, level: level })
        ]
    });
    return logger;
}