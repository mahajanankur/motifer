const { LoggerFactory } = require('../LoggerBuilder');
// /home/ankur/Grazitti/Code/gitlab_codebase/logger/logfiles/search.log
exports.logger = new LoggerFactory("search", "logfile.log", "info");