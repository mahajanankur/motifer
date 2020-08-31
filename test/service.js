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
        first: "Ankur",
        last: "Mahajan"
    },
    {
        first: "Mohan",
        last: "Rana"
    },
    {
        first: "Raj",
        last: "Kumar"
    }
]);