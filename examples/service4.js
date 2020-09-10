const LoggerBuilder = require("../LoggerBuilder");

const loggerBuilder = new LoggerBuilder(__filename, true);

loggerBuilder.info("Hello").arguments("arg").build();