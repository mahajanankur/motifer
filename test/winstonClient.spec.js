const chai = require('chai');
const expect = chai.expect;
const { winstonLoggerClient } = require('../winstonClient');
const fs = require('fs');
const path = require('path');
const testLogDir = path.join(__dirname, 'test-logs');

describe('winstonClient', () => {
    beforeEach(() => {
        // Create test log directory if it doesn't exist
        if (!fs.existsSync(testLogDir)) {
            fs.mkdirSync(testLogDir);
        }
    });

    afterEach(() => {
        // Clean up test log files
        if (fs.existsSync(testLogDir)) {
            fs.readdirSync(testLogDir).forEach(file => {
                fs.unlinkSync(path.join(testLogDir, file));
            });
            fs.rmdirSync(testLogDir);
        }
    });

    describe('File Transport', () => {
        it('should create a file transport with basic configuration', () => {
            const options = [{
                filename: path.join(testLogDir, 'test.log'),
                level: 'info'
            }];
            const logger = winstonLoggerClient('info', options);
            expect(logger.transports).to.have.lengthOf(2); // Console + File transport
        });

        it('should create a file transport with rotation enabled', () => {
            const options = [{
                filename: 'test-%DATE%.log',
                level: 'info',
                rotate: true,
                dirname: testLogDir,
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d'
            }];
            const logger = winstonLoggerClient('info', options);
            expect(logger.transports).to.have.lengthOf(2);
        });

        it('should throw error if filename is not provided', () => {
            const options = [{
                level: 'info'
            }];
            expect(() => winstonLoggerClient('info', options)).to.throw('filename is null');
        });

        it('should throw error if options is not an array', () => {
            const options = {
                filename: 'test.log',
                level: 'info'
            };
            expect(() => winstonLoggerClient('info', options)).to.throw('Options should be an array');
        });
    });

    describe('Level Filtering', () => {
        it('should filter logs based on onlyLevels option', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'crawlinfo.log'),
                level: 'crawlinfo',
                onlyLevels: ['crawlinfo']  // Only log crawlinfo messages
            }];
            const logger = winstonLoggerClient('info', options);
            
            // Log messages at different levels
            logger.log('crawlinfo', 'This should be logged');
            logger.log('sualert', 'This should not be logged');
            
            // Wait for file to be written
            setTimeout(() => {
                try {
                    const logContent = fs.readFileSync(path.join(testLogDir, 'crawlinfo.log'), 'utf8');
                    expect(logContent).to.include('This should be logged');
                    expect(logContent).to.not.include('This should not be logged');
                    done();
                } catch (error) {
                    done(error);
                }
            }, 500);
        });
    });

    describe('Log Formatting', () => {
        it('should format express logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'express.log'),
                level: 'info'
            }];
            const logger = winstonLoggerClient('info', options);

            // Mock express-http-context
            const httpContext = require('express-http-context');
            httpContext.get = () => 'test-request-id';

            logger.log('info', 'Test message', { isExpress: true, label: 'test-service', filename: 'test.js' });

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'express.log'), 'utf8');
                expect(logContent).to.include('[test-request-id]');
                expect(logContent).to.include('[test-service]');
                expect(logContent).to.include('[INFO]');
                expect(logContent).to.include('[test.js]');
                done();
            }, 100);
        });

        it('should format non-express logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'non-express.log'),
                level: 'info'
            }];
            const logger = winstonLoggerClient('info', options);

            logger.log('info', 'Test message', { label: 'test-service', filename: 'test.js' });

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'non-express.log'), 'utf8');
                expect(logContent).to.include('[test.js]');
                expect(logContent).to.include('[test-service]');
                expect(logContent).to.include('[INFO]');
                done();
            }, 100);
        });
    });

    describe('Log Level Verification', () => {
        it('should use default level when invalid level is provided', () => {
            const options = [{
                filename: path.join(testLogDir, 'default.log'),
                level: 'invalidLevel'
            }];
            const logger = winstonLoggerClient('invalidLevel', options);
            expect(logger.level).to.equal('info'); // default level
        });

        it('should accept custom log levels', () => {
            const options = [{
                filename: path.join(testLogDir, 'custom.log'),
                level: 'sualert'
            }];
            const logger = winstonLoggerClient('sualert', options);
            // Check if sualert is in the levels object
            expect(logger.levels).to.have.property('sualert');
        });
    });

    describe('Special Log Types', () => {
        it('should format crawlinfo logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'crawlinfo.log'),
                level: 'crawlinfo'
            }];
            const logger = winstonLoggerClient('info', options);

            logger.log('crawlinfo', 'Test crawlinfo message');

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'crawlinfo.log'), 'utf8');
                expect(logContent).to.include('[INFO]');
                expect(logContent).to.include('Test crawlinfo message');
                done();
            }, 100);
        });

        it('should format crawlerror logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'crawlerror.log'),
                level: 'crawlerror'
            }];
            const logger = winstonLoggerClient('info', options);

            logger.log('crawlerror', 'Test crawlerror message');

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'crawlerror.log'), 'utf8');
                expect(logContent).to.include('[ERROR]');
                expect(logContent).to.include('Test crawlerror message');
                done();
            }, 100);
        });

        it('should format crawlui logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'crawlui.log'),
                level: 'crawlui'
            }];
            const logger = winstonLoggerClient('info', options);

            logger.log('crawlui', 'Test crawlui message');

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'crawlui.log'), 'utf8');
                expect(logContent).to.equal('Test crawlui message\n');
                done();
            }, 100);
        });

        it('should format usersessionactivity logs correctly', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'usersession.log'),
                level: 'usersessionactivity'
            }];
            const logger = winstonLoggerClient('info', options);

            // Mock express-http-context
            const httpContext = require('express-http-context');
            httpContext.get = () => 'test-request-id';

            logger.log('usersessionactivity', 'Test user session message', {
                isExpress: true,
                label: 'test-service'
            });

            setTimeout(() => {
                const logContent = fs.readFileSync(path.join(testLogDir, 'usersession.log'), 'utf8');
                expect(logContent).to.include('[test-request-id]');
                expect(logContent).to.include('[test-service]');
                expect(logContent).to.include('[USERSESSIONACTIVITY]');
                expect(logContent).to.include('Test user session message');
                done();
            }, 100);
        });
    });
}); 