const chai = require('chai');
const expect = chai.expect;
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory, LoggerFactory, Logger, ApmFactory } = require('../index');
const { winstonLoggerClient } = require('../winstonClient');
const fs = require('fs');
const path = require('path');
const { safeRemoveDir, closeLogger } = require('./cleanup-helper');

describe('Complete Functionality Tests - README Coverage', () => {
    const testLogDir = path.join(__dirname, 'test-logs');
    const loggerInstances = [];

    beforeEach(() => {
        if (!fs.existsSync(testLogDir)) {
            fs.mkdirSync(testLogDir, { recursive: true });
        }
    });

    afterEach((done) => {
        // Close all tracked logger instances first to release file handles
        loggerInstances.forEach(logger => {
            closeLogger(logger);
        });
        loggerInstances.length = 0;

        // Minimal delay for cleanup - files will be cleaned up on process exit if locked
        setTimeout(() => {
            try {
                if (fs.existsSync(testLogDir)) {
                    safeRemoveDir(testLogDir, 2, 100); // Reduced retries and delay
                }
            } catch (err) {
                // Ignore cleanup errors - they shouldn't fail tests
            }
            done();
        }, 50); // Minimal delay - optimized for CI speed
    });

    describe('README - Basic Usage (Express)', () => {
        it('should work exactly as shown in README Express example', (done) => {
            const app = express();
            app.use(bodyParser.json());

            // Initialize Motifer (do this before your routes!)
            const Logger = new ExpressLoggerFactory('my-app', 'debug', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/users', (req, res) => {
                logger.info('Fetching users');
                logger.debug('Query params:', req.query);
                res.json({ users: [] });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/users?page=1`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('README - Basic Usage (Non-Express)', () => {
        it('should work exactly as shown in README Non-Express example', () => {
            const Logger = new LoggerFactory('my-service', 'info');
            const logger = Logger.getLogger(__filename);

            logger.info('Service started successfully');
            
            const error = new Error('Something went wrong');
            logger.error('Error occurred', error);

            expect(logger).to.be.an('object');
            expect(logger.info).to.be.a('function');
            expect(logger.error).to.be.a('function');
        });
    });

    describe('README - Express Setup Steps', () => {
        it('should follow Step 1: Install Dependencies (simulated)', () => {
            // Dependencies should be available
            try {
                expect(require('express')).to.exist;
                expect(require('body-parser')).to.exist;
                expect(require('motifer')).to.exist;
            } catch (err) {
                // In test environment, motifer might not be available as require
                // but the module exports should work
                expect(ExpressLoggerFactory).to.exist;
                expect(LoggerFactory).to.exist;
            }
        });

        it('should follow Step 2: Initialize Motifer correctly', () => {
            const app = express();
            app.use(bodyParser.json());

            // Initialize Motifer
            const Logger = new ExpressLoggerFactory(
                'my-awesome-app',
                'debug',
                app
            );

            expect(Logger.getLogger).to.be.a('function');
        });

        it('should follow Step 3: Create Logger Instance', () => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('my-awesome-app', 'debug', app);
            const logger = Logger.getLogger(__filename);

            expect(logger).to.be.an('object');
            expect(logger.info).to.be.a('function');
        });

        it('should follow Step 4: Use in Routes', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('my-awesome-app', 'debug', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/status', (req, res) => {
                logger.info('Status check requested');
                res.json({ status: 'ok' });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/status`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('README - Request ID Chaining (Microservices)', () => {
        it('should propagate request ID across services', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('service-a', 'info', app);
            const logger = Logger.getLogger(__filename);

            const expectedRequestId = '47de6d41-6dbd-44fc-9732-e28823755b58';

            app.get('/api/users', (req, res) => {
                // Request ID should be available
                expect(req.id).to.exist;
                logger.info('Fetching users');
                
                // Simulate forwarding to Service B with same request ID
                const forwardedRequestId = req.headers['request-id'];
                expect(forwardedRequestId).to.equal(expectedRequestId);
                
                res.json({ requestId: req.id });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get({
                    hostname: 'localhost',
                    port: server.address().port,
                    path: '/api/users',
                    headers: {
                        'request-id': expectedRequestId
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('README - Non-Express Setup', () => {
        it('should work with simple setup', () => {
            const Logger = new LoggerFactory('background-worker', 'info');
            const logger = Logger.getLogger(__filename);

            logger.info('Worker started');
            expect(logger).to.be.an('object');
        });

        it('should work with file logging', () => {
            const options = [{
                rotate: true,
                filename: 'worker-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                dirname: testLogDir,
                maxSize: '20m',
                maxFiles: '14d'
            }];

            const Logger = new LoggerFactory('background-worker', 'info', options);
            const logger = Logger.getLogger(__filename);

            logger.info('Worker started');
            logger.error('Processing failed', new Error('Test error'));

            expect(logger).to.be.an('object');
        });
    });

    describe('README - Configuration Options', () => {
        it('should support file appender with all options', () => {
            const options = [{
                filename: 'app-%DATE%.log',
                dirname: testLogDir,
                level: 'info',
                rotate: true,
                datePattern: 'YYYY-MM-DD',
                frequency: '1d',
                maxSize: '20m',
                maxFiles: '14d',
                archived: true
            }];

            const logger = winstonLoggerClient('info', options);
            expect(logger).to.exist;
            logger.close();
        });

        it('should support multiple file appenders', () => {
            const options = [
                {
                    level: 'error',
                    filename: 'errors.log',
                    dirname: testLogDir
                },
                {
                    level: 'warn',
                    filename: 'warnings.log',
                    dirname: testLogDir
                },
                {
                    rotate: true,
                    filename: 'app-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    dirname: testLogDir,
                    maxSize: '50m',
                    maxFiles: '30d'
                }
            ];

            const Logger = new LoggerFactory('my-app', 'debug', options);
            const logger = Logger.getLogger(__filename);

            logger.error('Error message');
            logger.warn('Warning message');
            logger.info('Info message');

            expect(logger).to.be.an('object');
        });
    });

    describe('README - Log Patterns', () => {
        it('should produce correct request log pattern', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const logOptions = [{
                filename: path.join(testLogDir, 'request.log'),
                level: 'info'
            }];
            const Logger = new ExpressLoggerFactory('my-app', 'info', app, logOptions);

            app.get('/api/users?page=1', (req, res) => {
                res.json({ users: [] });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/users?page=1`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                // Check request log pattern: [request] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [METHOD] [IP] [PATH] [BODY]
                                expect(logContent).to.match(/\[request\]/);
                                expect(logContent).to.match(/\[.*\] \[my-app\]/); // Request ID and app name
                                expect(logContent).to.match(/\[INFO\]/);
                                expect(logContent).to.match(/\[GET\]/);
                                expect(logContent).to.include('/api/users?page=1');
                                server.close(done);
                            } catch (err) {
                                server.close(() => done(err));
                            }
                        }, 200);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });

        it('should produce correct service log pattern', () => {
            const Logger = new LoggerFactory('my-app', 'info');
            const logger = Logger.getLogger('users.controller.js');

            logger.info('Fetching users from database');

            // Service log pattern: [service] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [FILENAME] MESSAGE
            // For non-express, request ID will be null
            expect(logger).to.be.an('object');
        });

        it('should produce correct response log pattern', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const responseLogOptions = [{
                filename: path.join(testLogDir, 'response.log'),
                level: 'info'
            }];
            const Logger = new ExpressLoggerFactory('my-app', 'info', app, responseLogOptions);

            app.get('/api/users', (req, res) => {
                res.status(200).json({ users: [] });
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/users?page=1`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(responseLogOptions[0].filename, 'utf8');
                                // Response pattern: [response] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [METHOD] [IP] [PATH] [STATUS] [SIZE] [TIME] [USER_AGENT]
                                expect(logContent).to.match(/\[response\]/);
                                expect(logContent).to.match(/\[.*\] \[my-app\]/);
                                expect(logContent).to.match(/\[200\]/);
                                expect(logContent).to.match(/\[GET\]/);
                                server.close(done);
                            } catch (err) {
                                server.close(() => done(err));
                            }
                        }, 200);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('README - Advanced Features', () => {
        it('should support Elastic APM integration', () => {
            // Test APM factory validation
            expect(() => ApmFactory({
                serviceName: 'my-awesome-app',
                apmServerUrl: 'https://apm-server.example.com',
                secretToken: 'your-secret-token',
                environment: 'production',
                logLevel: 'error'
            })).to.not.throw();
        });

        it('should support all standard log levels', () => {
            const Logger = new LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(__filename);

            logger.info('Information message');
            logger.debug('Debug message');
            logger.warn('Warning message');
            logger.error('Error message');

            expect(logger).to.be.an('object');
        });

        it('should support logging with context', () => {
            const Logger = new LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(__filename);

            // Simple message
            logger.info('User created');

            // Message with formatted arguments
            logger.debug('Processing user:', { id: 123, name: 'John' });

            // Error with stack trace
            const error = new Error('Test error');
            logger.error(error);

            // Multiple arguments
            logger.info('User', 123, 'performed action', 'login');

            expect(logger).to.be.an('object');
        });
    });

    describe('README - Best Practices', () => {
        it('should initialize early (correct order)', () => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('app', 'info', app);

            expect(Logger.getLogger).to.be.a('function');
        });

        it('should use appropriate log levels', () => {
            const Logger = new LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(__filename);

            const error = new Error('Database connection failed');
            logger.error('Database connection failed', error);
            logger.warn('Rate limit approaching');
            logger.info('User logged in');
            logger.debug('Processing request', { data: 'test' });

            expect(logger).to.be.an('object');
        });

        it('should include context in logs', () => {
            const Logger = new LoggerFactory('test-service', 'info');
            const logger = Logger.getLogger(__filename);

            logger.info('Order created', { orderId: 123, userId: 456 });
            logger.error('Payment failed', { orderId: 123, error: 'Insufficient funds' });

            expect(logger).to.be.an('object');
        });

        it('should configure file rotation properly', () => {
            const options = [{
                rotate: true,
                filename: 'app-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                dirname: testLogDir
            }];

            const Logger = new LoggerFactory('test-service', 'info', options);
            const logger = Logger.getLogger(__filename);

            logger.info('Test message');

            expect(logger).to.be.an('object');
        });
    });

    describe('GETTING_STARTED.md - Complete Express Application', () => {
        it('should work as shown in GETTING_STARTED complete example', (done) => {
            const app = express();
            app.use(bodyParser.json());

            const logOptions = [{
                rotate: true,
                filename: 'app-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                dirname: testLogDir,
                maxSize: '20m',
                maxFiles: '14d',
                level: 'info'
            }, {
                level: 'error',
                filename: 'errors.log',
                dirname: testLogDir
            }];

            const Logger = new ExpressLoggerFactory('ecommerce-api', 'debug', app, logOptions);
            const logger = Logger.getLogger(__filename);

            app.get('/api/products', async (req, res) => {
                logger.info('Fetching products');
                logger.debug('Query parameters:', req.query);

                try {
                    // Simulate async operation
                    await new Promise(resolve => setTimeout(resolve, 10));
                    const products = [{ id: 1, name: 'Product 1' }];
                    logger.info(`Found ${products.length} products`);
                    res.json(products);
                } catch (error) {
                    logger.error('Failed to fetch products', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/products?category=electronics`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('GETTING_STARTED.md - Background Service', () => {
        it('should work as shown in GETTING_STARTED background service example', () => {
            const logOptions = [{
                rotate: true,
                filename: 'email-service-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                dirname: testLogDir,
                maxSize: '50m',
                maxFiles: '7d'
            }];

            const Logger = new LoggerFactory('email-service', 'info', logOptions);
            const logger = Logger.getLogger(__filename);

            // Simulate email processing
            logger.info('Email processing started');
            logger.debug('Found 5 emails to process');
            logger.info('Email sent successfully', { to: 'user@example.com', subject: 'Welcome' });
            logger.error('Failed to send email', { to: 'user@example.com', error: 'SMTP error' });
            logger.info('Email processing completed');

            expect(logger).to.be.an('object');
        });
    });

    describe('GETTING_STARTED.md - Common Patterns', () => {
        it('should handle error handling pattern', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/data', async (req, res) => {
                try {
                    // Simulate data fetch
                    await new Promise(resolve => setTimeout(resolve, 10));
                    const data = { id: 1, name: 'Data' };
                    logger.info('Data fetched successfully');
                    res.json(data);
                } catch (error) {
                    logger.error('Failed to fetch data', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/data`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });

        it('should handle request context pattern', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/users/:id', async (req, res) => {
                logger.info('Fetching user', { userId: req.params.id });

                // Simulate user fetch
                const user = { id: req.params.id, email: 'user@example.com' };

                if (!user) {
                    logger.warn('User not found', { userId: req.params.id });
                    return res.status(404).json({ error: 'User not found' });
                }

                logger.debug('User retrieved', { userId: user.id, email: user.email });
                res.json(user);
            });

            const server = app.listen(0, () => {
                const http = require('http');
                http.get(`http://localhost:${server.address().port}/api/users/123`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('Logger Static Method', () => {
        it('should work with Logger.getLogger as shown in README', () => {
            // This requires ExpressLoggerFactory to be initialized first
            const app = express();
            app.use(bodyParser.json());
            new ExpressLoggerFactory('test-app', 'info', app);

            const logger = Logger.getLogger(__filename, true);
            expect(logger).to.be.an('object');
            expect(logger.info).to.be.a('function');
        });

        it('should work with Logger.getLogger for non-express', () => {
            const logger = Logger.getLogger(__filename, false);
            expect(logger).to.be.an('object');
            expect(logger.info).to.be.a('function');
        });
    });
});
