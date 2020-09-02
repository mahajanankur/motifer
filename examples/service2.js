const { Logger } = require('./index');

let logger = Logger.getLogger(__filename);

exports.sampleLogs = () => {
    let element = { name: "Ankur" };
    logger
        .info(`Info log message.`)
        .arguments(element)
        .build();

    logger
        .debug(`Debug log message.`)
        .build();
}