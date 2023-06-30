const chai = require('chai');
const expect = chai.expect;
const { LoggerFactory, ExpressLoggerFactory, Logger, ApmFactory } = require('../index');

describe('LoggerFactory', () => {
    /**
     * Test case: should return a LoggerBuilder instance
     * Description: Tests whether LoggerFactory returns a LoggerBuilder instance.
     */
    it('should return a LoggerBuilder instance', () => {
        const loggerFactory = LoggerFactory('service', 'info', []);
        expect(loggerFactory).to.be.an.instanceOf(Object);
        expect(loggerFactory.getLogger).to.be.a('function');
    });

    /**
     * Test case: should throw an error if service name is not provided
     * Description: Tests whether LoggerFactory throws an error when the service name is not provided.
     */
    it('should throw an error if service name is not provided', () => {
        expect(() => LoggerFactory()).to.throw('Service name is required');
    });

    /**
     * Test case: should throw an error if an invalid log level is provided
     * Description: Tests whether LoggerFactory throws an error when an invalid log level is provided.
     */
    it('should throw an error if an invalid log level is provided', () => {
        expect(() => LoggerFactory('service', 'invalidLevel')).to.throw('Invalid log level');
    });

    /**
     * Test case: should return a LoggerBuilder instance with default log level if not provided
     * Description: Tests whether LoggerFactory returns a LoggerBuilder instance with the default log level if not provided.
     */
    it('should return a LoggerBuilder instance with default log level if not provided', () => {
        const loggerFactory = LoggerFactory('service');
        expect(loggerFactory).to.be.an.instanceOf(Object);
        expect(loggerFactory.getLogger).to.be.a('function');
    });

    /**
     * Test case: should return a LoggerBuilder instance with custom log level
     * Description: Tests whether LoggerFactory returns a LoggerBuilder instance with the custom log level.
     */
    it('should return a LoggerBuilder instance with custom log level', () => {
        const loggerFactory = LoggerFactory('service', 'debug');
        expect(loggerFactory).to.be.an.instanceOf(Object);
        expect(loggerFactory.getLogger).to.be.a('function');
    });

    /**
     * Test case: should log a message with additional context
     * Description: Tests whether Logger.info logs a message with additional context.
     */
    it('should create a logger object with the expected log message', () => {
        // Mocking the winstonLoggerClient function
        const winstonLoggerClient = (level, options) => {
            // Mocking the log method
            const log = (logObject) => {
                // Asserting that the log message contains the expected substring
                expect(logObject.message).to.include('User logged in { user: \'john_doe\', action: \'login\' }');
            };

            return { log };
        };

        // Creating an instance of LoggerFactory with a mock winstonLoggerClient
        const loggerFactory = new LoggerFactory('service', 'info', [], winstonLoggerClient);
        const logger = loggerFactory.getLogger('filename');

        // Logging a message
        logger.info('User logged in { user: \'john_doe\', action: \'login\' }');
    });
});

describe('ExpressLoggerFactory', () => {
    /**
     * Test case: should return a LoggerBuilder instance
     * Description: Tests whether ExpressLoggerFactory returns a LoggerBuilder instance.
     */
    it('should return a LoggerBuilder instance', () => {
        const expressLoggerFactory = ExpressLoggerFactory('service', 'info', null, []);
        expect(expressLoggerFactory).to.be.an.instanceOf(Object);
        expect(expressLoggerFactory.getLogger).to.be.a('function');
    });

    /**
     * Test case: should throw an error if service name is not provided
     * Description: Tests whether ExpressLoggerFactory throws an error when the service name is not provided.
     */
    it('should throw an error if service name is not provided', () => {
        expect(() => ExpressLoggerFactory()).to.throw('Service name is required');
    });

    /**
     * Test case: should throw an error if an invalid log level is provided
     * Description: Tests whether ExpressLoggerFactory throws an error when an invalid log level is provided.
     */
    it('should throw an error if an invalid log level is provided', () => {
        expect(() => ExpressLoggerFactory('service', 'invalidLevel')).to.throw('Invalid log level');
    });

    /**
     * Test case: should return a LoggerBuilder instance with default log level if not provided
     * Description: Tests whether ExpressLoggerFactory returns a LoggerBuilder instance with the default log level if not provided.
     */
    it('should return a LoggerBuilder instance with default log level if not provided', () => {
        const expressLoggerFactory = ExpressLoggerFactory('service');
        expect(expressLoggerFactory).to.be.an.instanceOf(Object);
        expect(expressLoggerFactory.getLogger).to.be.a('function');
    });

    /**
     * Test case: should return a LoggerBuilder instance with custom log level
     * Description: Tests whether ExpressLoggerFactory returns a LoggerBuilder instance with the custom log level.
     */
    it('should return a LoggerBuilder instance with custom log level', () => {
        const expressLoggerFactory = ExpressLoggerFactory('service', 'debug');
        expect(expressLoggerFactory).to.be.an.instanceOf(Object);
        expect(expressLoggerFactory.getLogger).to.be.a('function');
    });

    /**
    * Test case: should log a message with additional context
    * Description: Tests whether Logger.info logs a message with additional context.
    */
    it('should create a logger object with the expected log message', () => {
        // Mocking the winstonLoggerClient function
        const winstonLoggerClient = (level, options) => {
            // Mocking the log method
            const log = (logObject) => {
                // Asserting that the log message contains the expected substring
                expect(logObject.message).to.include('User logged in { user: \'john_doe\', action: \'login\' }');
            };

            return { log };
        };

        // Creating an instance of LoggerFactory with a mock winstonLoggerClient
        const expressLoggerFactory = new ExpressLoggerFactory('service', 'info', null, [], winstonLoggerClient);
        const logger = expressLoggerFactory.getLogger('filename');

        // Logging a message
        logger.info('User logged in { user: \'john_doe\', action: \'login\' }');
    });
});

describe('Logger', () => {
    /**
     * Test case: should return a LoggerBuilder instance
     * Description: Tests whether Logger.getLogger returns a LoggerBuilder instance.
     */
    it('should return a LoggerBuilder instance', () => {
        const logger = Logger.getLogger('filename', true);
        expect(logger).to.be.an.instanceOf(Object);
        expect(logger.info).to.be.a('function');
        expect(logger.debug).to.be.a('function');
        expect(logger.error).to.be.a('function');
        expect(logger.warn).to.be.a('function');
        expect(logger.crawlError).to.be.a('function');
        expect(logger.crawlInfo).to.be.a('function');
        expect(logger.crawlUi).to.be.a('function');
        expect(logger.build).to.be.a('function');
    });

    /**
     * Test case: should log a message with additional context
     * Description: Tests whether Logger.info logs a message with additional context.
     */
    // it('should log a message with additional context', () => {
    //     const logger = Logger.getLogger('filename');
    //     expect(logger.info('User logged in user: john_doe, action: login')).toString.to.include('User logged in user: john_doe, action: login');
    // });

    /**
     * Test case: should not log a message if logging is disabled
     * Description: Tests whether Logger methods do not log a message if logging is disabled.
     */
    // it('should not log a message if logging is disabled', () => {
    //     const logger = Logger.getLogger('filename', false);
    //     expect(logger.info('Message')).to.be.undefined;
    //     expect(logger.debug('Message')).to.be.undefined;
    //     expect(logger.error('Message')).to.be.undefined;
    //     expect(logger.warn('Message')).to.be.undefined;
    //     expect(logger.crawlError('Message')).to.be.undefined;
    //     expect(logger.crawlInfo('Message')).to.be.undefined;
    //     expect(logger.crawlUi('Message')).to.be.undefined;
    //     expect(logger.build('Message')).to.be.undefined;
    // });
});
