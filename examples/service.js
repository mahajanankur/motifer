const { Logger } = require('./index');
const logger = Logger.getLogger(__filename);

const getTerminatedEmployees = employees => {
    employees.forEach(element => {
        logger.info(`The first name is ${element.first}`).arguments(element).build();
        otherFunction();
        logger.debug(`The function is successfull`).build();
    });
    throwException(new Error("Sample Error"));
}

const otherFunction = () => {
    logger.debug(`In the other function`).build();
}

const throwException = (err) => {
    // logger.error(`Exception thrown`).arguments(err.stack).build();
    logger.error(err.stack).build();
    // console.log(err.stack);
}

getTerminatedEmployees([
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