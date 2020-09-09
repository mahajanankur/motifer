const { LoggerFactory } = require('../index');
// /home/ankur/Grazitti/Code/gitlab_codebase/logger/logfiles/search.log
exports.Logger = new LoggerFactory("analytics", "debug", "logfile.log");