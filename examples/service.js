const { Logger } = require('./index');
const logger = Logger.getLogger(__filename);

const getEmployees = employees => {
    employees.forEach(element => {
        logger.info(`The first name is ${element.first}`);
        otherFunction();
        logger.debug(`The function is successfull`, element);
    });
    throwException(new Error("Sample Error"));
}

const otherFunction = () => {
    const obj = { key1: "value1", key2: ["some", "array", "values"] };
    logger.debug(`In the other function`, obj);
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