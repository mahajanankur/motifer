const { Logger } = require('./index');
const { sampleLogs } = require('./service2');

let logger = Logger.getLogger(__filename);

const printFirstNames = employees => {
    employees.forEach(element => {
        logger
            .info(`The first name is ${element.first}`)
            .arguments(element)
            .build();
        otherFunction();
        sampleLogs();
    });
}

const otherFunction = () => {
    logger
        .debug(`The other function.`)
        .build();
}

printFirstNames([
    {
        first: "John",
        last: "Doe"
    },
    {
        first: "Doe",
        last: "John"
    },
    {
        first: "Ankur",
        last: "Mahajan"
    }
]);