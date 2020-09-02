const { logger } = require('./index');
logger.setFilename(__filename);

const printFirstNames = employees => {
    employees.forEach(element => {
        logger
            .setLevel("info")
            .setMessage(`The first name is ${element.first}`)
            .setArguments(element)
            .build();
        otherFunction();
    });
}

const otherFunction = () => {
    logger
        .setLevel("debug")
        .setMessage(`The other function.`)
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