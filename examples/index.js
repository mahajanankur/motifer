const { LoggerFactory } = require('../index');

let options = {
    "rotate": true,
    "filename": "logfile-%DATE%.log",
    "frequency": "5m",
    "datePattern": "YYYY-MM-DD-HHmm",
    "archived": true,
    "maxSize": "20m",
    "maxFiles": "14d",
    "dirname": "/home/ankur/motifer/examples"
}

exports.Logger = new LoggerFactory("analytics", "debug", options);