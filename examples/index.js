const { LoggerFactory } = require('../index');
// /logger/logfiles/search.log
exports.Logger = new LoggerFactory("analytics", "debug", "logfile.log");