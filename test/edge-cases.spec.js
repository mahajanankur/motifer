const chai = require('chai');
const expect = chai.expect;
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory, LoggerFactory, ApmFactory } = require('../index');
const { winstonLoggerClient } = require('../winstonClient');
const fs = require('fs');
const path = require('path');

describe('Edge Cases and Error Handling', () => {
    const testLogDir = path.join(__dirname, 'test-logs');

    beforeEach(() => {
        if (!fs.existsSync(testLogDir)) {
            fs.mkdirSync(testLogDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(testLogDir)) {
            try {
                fs.readdirSync(testLogDir).forEach(file => {
                    const filePath = path.join(testLogDir, file);
                    if (fs.statSync(filePath).isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(filePath);
                    }
                });
                fs.rmSync(testLogDir, { recursive: true, force: true });
            } catch (err) {
                // Ignore cleanup errors
            }
        }
    });

    describe('Null and Undefined Handling', () => {
        it('should handle null service name gracefully', () => {
            expect(() => LoggerFactory(null)).to.throw('Service name is required');
            expect(() => LoggerFactory(undefined)).to.throw('Service name is required');
            expect(() => LoggerFactory('')).to.throw('Service name is required');
        });

        it('should handle null/undefined log levels', () => {
            const Logger = LoggerFactory('test-service', null);
            expect(Logger.getLogger).to.be.a('function');
            
            const Logger2 = LoggerFactory('test-service', undefined);
            expect(Logger2.getLogger).to.be.a('function');
        });

        it('should handle null/undefined options', () => {
            const Logger = LoggerFactory('test-service', 'info', null);
            expect(Logger.getLogger).to.be.a('function');
            
            const Logger2 = LoggerFactory('test-service', 'info', undefined);
            expect(Logger2.getLogger).to.be.a('function');
        });

        it('should handle null filename in getLogger', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(null);
            expect(logger).to.be.an('object');
            expect(logger.info).to.be.a('function');
        });

        it('should handle undefined filename in getLogger', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(undefined);
            expect(logger).to.be.an('object');
        });

        it('should handle empty string filename', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('');
            expect(logger).to.be.an('object');
        });
    });

    describe('Invalid Input Handling', () => {
        it('should handle invalid log level gracefully', () => {
            expect(() => LoggerFactory('test', 'invalid-level')).to.throw('Invalid log level');
        });

        it('should handle non-array options', () => {
            expect(() => winstonLoggerClient('info', { filename: 'test.log' }))
                .to.throw('Options should be an array');
        });

        it('should handle options array with missing filename', () => {
            expect(() => winstonLoggerClient('info', [{ level: 'info' }]))
                .to.throw('filename is null');
        });

        it('should handle invalid file paths gracefully', () => {
            const options = [{
                filename: '/invalid/path/that/does/not/exist/test.log',
                level: 'info'
            }];

            // Should not throw immediately, but may fail on write
            // Winston will try to create directory, which may fail
            try {
                const logger = winstonLoggerClient('info', options);
                expect(logger).to.exist;
                logger.close();
            } catch (error) {
                // File path errors are acceptable
                expect(error.message).to.include('ENOENT');
            }
        });
    });

    describe('Filename Path Handling', () => {
        it('should extract filename from Windows path', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('C:\\Users\\test\\file.js');
            expect(logger).to.be.an('object');
        });

        it('should extract filename from Unix path', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('/home/user/project/file.js');
            expect(logger).to.be.an('object');
        });

        it('should handle path with multiple separators', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('path/to/nested/file.js');
            expect(logger).to.be.an('object');
        });

        it('should handle filename without path', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('file.js');
            expect(logger).to.be.an('object');
        });
    });

    describe('Log Message Formatting', () => {
        it('should handle messages with special characters', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            expect(() => {
                logger.info('Message with "quotes" and \'single quotes\'');
                logger.info('Message with newline\nand tab\t');
                logger.info('Message with unicode: 测试 🚀');
            }).to.not.throw();
        });

        it('should handle messages with objects', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            expect(() => {
                logger.info('User data:', { name: 'John', age: 30 });
                logger.debug('Complex object:', { nested: { data: [1, 2, 3] } });
            }).to.not.throw();
        });

        it('should handle messages with circular references', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            const circular = { name: 'test' };
            circular.self = circular;
            
            expect(() => {
                logger.info('Circular object:', circular);
            }).to.not.throw();
        });

        it('should handle very long messages', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            const longMessage = 'x'.repeat(10000);
            expect(() => {
                logger.info(longMessage);
            }).to.not.throw();
        });

        it('should handle empty messages', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            expect(() => {
                logger.info('');
                logger.debug();
                logger.warn(null);
            }).to.not.throw();
        });
    });

    describe('Error Object Handling', () => {
        it('should handle Error objects', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            const error = new Error('Test error');
            expect(() => {
                logger.error(error);
                logger.error('Error occurred:', error);
            }).to.not.throw();
        });

        it('should handle errors with stack traces', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            try {
                throw new Error('Test error with stack');
            } catch (error) {
                expect(() => {
                    logger.error(error);
                }).to.not.throw();
            }
        });

        it('should handle multiple error arguments', () => {
            const Logger = LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger('test.js');
            
            const error1 = new Error('Error 1');
            const error2 = new Error('Error 2');
            
            expect(() => {
                logger.error('Multiple errors:', error1, error2);
            }).to.not.throw();
        });
    });

    describe('File Rotation Edge Cases', () => {
        it('should handle rotation with invalid date pattern', () => {
            const options = [{
                rotate: true,
                filename: 'test-%DATE%.log',
                datePattern: 'INVALID',
                dirname: testLogDir
            }];

            // Should not throw, but may use default pattern
            const logger = winstonLoggerClient('info', options);
            expect(logger).to.exist;
            logger.close();
        });

        it('should handle rotation with very small maxSize', () => {
            const options = [{
                rotate: true,
                filename: 'test-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                dirname: testLogDir,
                maxSize: '1b' // 1 byte - will rotate immediately
            }];

            const logger = winstonLoggerClient('info', options);
            logger.info('Test message');
            logger.close();
            
            // Should not throw
            expect(logger).to.exist;
        });

        it('should handle rotation with zero maxFiles', () => {
            const options = [{
                rotate: true,
                filename: 'test-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                dirname: testLogDir,
                maxFiles: 0
            }];

            const logger = winstonLoggerClient('info', options);
            logger.info('Test message');
            logger.close();
            
            expect(logger).to.exist;
        });
    });

    describe('Express Edge Cases', () => {
        it('should handle ExpressLoggerFactory without express app', () => {
            const Logger = ExpressLoggerFactory('test-service', 'info', null);
            expect(Logger.getLogger).to.be.a('function');
        });

        it('should handle requests without body', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/test', (req, res) => {
                logger.info('No body request');
                res.json({ success: true });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/test`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });

        it('should handle malformed JSON in request body', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.post('/api/test', (req, res) => {
                logger.info('Request received');
                res.json({ success: true });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                const req = http.request({
                    hostname: 'localhost',
                    port: server.address().port,
                    path: '/api/test',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                });

                req.on('error', () => {
                    server.close(done);
                });

                req.write('{ invalid json }');
                req.end();
            });
        });
    });

    describe('APM Factory Edge Cases', () => {
        it('should validate required APM parameters', () => {
            expect(() => ApmFactory({})).to.throw();
            expect(() => ApmFactory({ serviceName: 'test' })).to.throw();
            expect(() => ApmFactory({ serviceName: 'test', apmServerUrl: 'http://test.com' })).to.throw();
        });

        it('should handle invalid APM server URL', () => {
            expect(() => ApmFactory({
                serviceName: 'test',
                apmServerUrl: 'not-a-valid-url',
                secretToken: 'token'
            })).to.throw();
        });

        it('should use default values for optional APM parameters', () => {
            // This will actually start APM, so we'll just check it doesn't throw with defaults
            try {
                ApmFactory({
                    serviceName: 'test-service',
                    apmServerUrl: 'http://localhost:8200',
                    secretToken: 'test-token'
                });
            } catch (err) {
                // Connection errors are expected in test environment
                expect(err.message).to.not.include('required');
            }
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle rapid logger creation and destruction', () => {
            for (let i = 0; i < 50; i++) {
                const Logger = LoggerFactory(`service-${i}`, 'info');
                const logger = Logger.getLogger(`file-${i}.js`);
                logger.info(`Message ${i}`);
            }
            // Should not throw
            expect(true).to.be.true;
        });

        it('should handle logging from multiple loggers simultaneously', () => {
            const logger1 = LoggerFactory('service-1', 'info').getLogger('file1.js');
            const logger2 = LoggerFactory('service-2', 'info').getLogger('file2.js');
            const logger3 = LoggerFactory('service-3', 'info').getLogger('file3.js');

            for (let i = 0; i < 100; i++) {
                logger1.info(`Logger 1 message ${i}`);
                logger2.info(`Logger 2 message ${i}`);
                logger3.info(`Logger 3 message ${i}`);
            }

            // Should not throw
            expect(true).to.be.true;
        });
    });

    describe('Log Level Edge Cases', () => {
        it('should handle all valid log levels', () => {
            const validLevels = ["crawlerror", "crawlui", "crawlinfo", "error", "warn", "info", 
                               "http", "verbose", "debug", "silly", "usersessionactivity", 
                               "crawlalert", "sualert"];

            validLevels.forEach(level => {
                const Logger = LoggerFactory('test-service', level);
                expect(Logger.getLogger).to.be.a('function');
            });
        });

        it('should handle case-insensitive log levels', () => {
            // Note: The code now converts to lowercase for validation
            const Logger1 = LoggerFactory('test-service', 'info'); // lowercase
            const Logger2 = LoggerFactory('test-service', 'Info'); // mixed case - will be converted
            const Logger3 = LoggerFactory('test-service', 'INFO'); // uppercase - will be converted
            
            expect(Logger1.getLogger).to.be.a('function');
            expect(Logger2.getLogger).to.be.a('function');
            expect(Logger3.getLogger).to.be.a('function');
        });
    });
});
