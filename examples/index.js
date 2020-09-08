const { LoggerFactory } = require('../index');
// /home/ankur/Grazitti/Code/gitlab_codebase/logger/logfiles/search.log
exports.Logger = new LoggerFactory("search", "debug", "logfile.log");