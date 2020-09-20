const { Logger } = require('./index');
const logger = Logger.getLogger(__filename);

const getEmployees = employees => {
    employees.forEach(element => {
        logger.info(`The first name is ${element.first}`);
        otherFunction();
        logger.debug(`The function is successfull`);
    });
    throwException(new Error("Sample Error"));
}

const otherFunction = () => {
    logger.debug(`In the other function`);
}

const throwException = (err) => {
    // logger.error(`Exception thrown`);
    logger.error(err.stack);
    // console.log(err.stack);
}

getEmployees([
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