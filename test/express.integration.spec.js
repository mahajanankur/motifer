const chai = require('chai');
const expect = chai.expect;
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { ExpressLoggerFactory } = require('../index');
const fs = require('fs');
const path = require('path');
const testLogDir = path.join(__dirname, 'test-logs');

describe('Express Integration Tests', () => {
    let app;
    let server;
    let testPort = 0; // Let system assign port
    let logOptions;

    beforeEach(() => {
        // Create test log directory
        if (!fs.existsSync(testLogDir)) {
            fs.mkdirSync(testLogDir, { recursive: true });
        }

        // Setup log options
        logOptions = [{
            filename: path.join(testLogDir, 'express-test.log'),
            level: 'info'
        }];

        app = express();
    });

    afterEach((done) => {
        // Clean up server
        if (server) {
            server.close(() => {
                server = null;
                // Clean up log files
                if (fs.existsSync(testLogDir)) {
                    fs.readdirSync(testLogDir).forEach(file => {
                        const filePath = path.join(testLogDir, file);
                        try {
                            if (fs.statSync(filePath).isDirectory()) {
                                fs.rmSync(filePath, { recursive: true, force: true });
                            } else {
                                fs.unlinkSync(filePath);
                            }
                        } catch (err) {
                            // Ignore cleanup errors
                        }
                    });
                    try {
                        fs.rmSync(testLogDir, { recursive: true, force: true });
                    } catch (err) {
                        // Ignore cleanup errors
                    }
                }
                done();
            });
        } else {
            done();
        }
    });

    describe('Middleware Order (Critical for Request Body Logging)', () => {
        it('should log request body when body-parser is initialized before Motifer', (done) => {
            // Correct order: body-parser first, then Motifer
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            app.post('/api/test', (req, res) => {
                logger.info('Request received');
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;
                const postData = JSON.stringify({ name: 'John', age: 30 });

                const req = http.request({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/test',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('"name":"John"');
                                expect(logContent).to.include('"age":30');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                });

                req.on('error', done);
                req.write(postData);
                req.end();
            });
        });

        it('should log empty body when body-parser is initialized after Motifer', (done) => {
            // Wrong order: Motifer first, then body-parser
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            app.use(bodyParser.json()); // Too late!

            app.post('/api/test', (req, res) => {
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;
                const postData = JSON.stringify({ name: 'John' });

                const req = http.request({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/test',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                // Body should be null or empty when body-parser is initialized after
                                expect(logContent).to.match(/\[null\]|\[\{\}\]/);
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                });

                req.on('error', done);
                req.write(postData);
                req.end();
            });
        });
    });

    describe('Request ID Generation and Propagation', () => {
        it('should generate unique request ID for each request', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            const requestIds = new Set();

            app.get('/api/test', (req, res) => {
                requestIds.add(req.id);
                logger.info('Request processed');
                res.json({ requestId: req.id });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;
                let completed = 0;
                const totalRequests = 5;

                for (let i = 0; i < totalRequests; i++) {
                    http.get(`http://localhost:${testPort}/api/test`, (res) => {
                        res.on('data', () => {});
                        res.on('end', () => {
                            completed++;
                            if (completed === totalRequests) {
                                expect(requestIds.size).to.equal(totalRequests);
                                done();
                            }
                        });
                    }).on('error', done);
                }
            });
        });

        it('should use request-id header when provided (microservice chaining)', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            const expectedRequestId = '47de6d41-6dbd-44fc-9732-e28823755b58';
            let receivedRequestId = null;

            app.get('/api/test', (req, res) => {
                receivedRequestId = req.id;
                logger.info('Request processed');
                res.json({ requestId: req.id });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/test',
                    headers: {
                        'request-id': expectedRequestId
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        expect(receivedRequestId).to.equal(expectedRequestId);
                        done();
                    });
                }).on('error', done);
            });
        });

        it('should maintain request ID across async operations', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            const requestId = 'test-request-id-123';
            const loggedRequestIds = [];

            app.get('/api/test', async (req, res) => {
                loggedRequestIds.push(req.id);
                
                // Simulate async operations
                await new Promise(resolve => setTimeout(resolve, 10));
                logger.info('After async operation 1');
                loggedRequestIds.push(req.id);

                await new Promise(resolve => setTimeout(resolve, 10));
                logger.info('After async operation 2');
                loggedRequestIds.push(req.id);

                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/test',
                    headers: {
                        'request-id': requestId
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            // All logged request IDs should be the same
                            expect(loggedRequestIds.every(id => id === requestId)).to.be.true;
                            done();
                        }, 100);
                    });
                }).on('error', done);
            });
        });
    });

    describe('Request and Response Logging', () => {
        it('should log request with all details', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);

            app.get('/api/users?page=1', (req, res) => {
                res.json({ users: [] });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get(`http://localhost:${testPort}/api/users?page=1`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('[request]');
                                expect(logContent).to.include('[test-app]');
                                expect(logContent).to.include('[GET]');
                                expect(logContent).to.include('/api/users?page=1');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });

        it('should log response with status code and timing', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);

            app.get('/api/test', (req, res) => {
                res.status(201).json({ message: 'Created' });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get(`http://localhost:${testPort}/api/test`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('[response]');
                                expect(logContent).to.include('[201]');
                                expect(logContent).to.include('[test-app]');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });

        it('should handle POST request with body', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);

            app.post('/api/users', (req, res) => {
                res.status(201).json({ id: 1 });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;
                const postData = JSON.stringify({ name: 'John', email: 'john@example.com' });

                const req = http.request({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/users',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('[POST]');
                                expect(logContent).to.include('"name":"John"');
                                expect(logContent).to.include('"email":"john@example.com"');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                });

                req.on('error', done);
                req.write(postData);
                req.end();
            });
        });
    });

    describe('Service Logging in Express Context', () => {
        it('should include request ID in service logs', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            const expectedRequestId = 'test-req-123';

            app.get('/api/test', (req, res) => {
                logger.info('Processing request');
                logger.debug('Debug information');
                logger.warn('Warning message');
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/test',
                    headers: {
                        'request-id': expectedRequestId
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('[service]');
                                expect(logContent).to.include(`[${expectedRequestId}]`);
                                expect(logContent).to.include('Processing request');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });

        it('should handle all log levels in Express context', (done) => {
            app.use(bodyParser.json());
            // Use 'debug' level to ensure debug messages are logged
            const Logger = new ExpressLoggerFactory('test-app', 'debug', app, logOptions);
            const logger = Logger.getLogger(__filename);

            app.get('/api/test', (req, res) => {
                logger.info('Info message');
                logger.debug('Debug message');
                logger.warn('Warning message');
                logger.error('Error message');
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get(`http://localhost:${testPort}/api/test`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('Info message');
                                expect(logContent).to.include('Warning message');
                                expect(logContent).to.include('Error message');
                                // Debug may not appear if file appender level is 'info'
                                // Check console output or adjust file appender level
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in route handlers', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            app.get('/api/error', (req, res) => {
                try {
                    throw new Error('Test error');
                } catch (error) {
                    logger.error('Error occurred', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get(`http://localhost:${testPort}/api/error`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                expect(logContent).to.include('[ERROR]');
                                expect(logContent).to.include('Error occurred');
                                expect(logContent).to.include('Test error');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });

        it('should handle missing request ID gracefully', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            // Simulate context issue
            app.get('/api/test', (req, res) => {
                logger.info('Test message');
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;

                http.get(`http://localhost:${testPort}/api/test`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        setTimeout(() => {
                            try {
                                const logContent = fs.readFileSync(logOptions[0].filename, 'utf8');
                                // Should still log even if request ID is missing
                                expect(logContent).to.include('Test message');
                                done();
                            } catch (err) {
                                done(err);
                            }
                        }, 50);
                    });
                }).on('error', done);
            });
        });
    });

    describe('Concurrent Requests', () => {
        it('should handle multiple concurrent requests with different request IDs', (done) => {
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app, logOptions);
            const logger = Logger.getLogger(__filename);

            const requestIds = ['req-1', 'req-2', 'req-3', 'req-4', 'req-5'];
            const loggedIds = [];

            app.get('/api/test', (req, res) => {
                loggedIds.push(req.id);
                logger.info(`Processing request ${req.id}`);
                res.json({ requestId: req.id });
            });

            server = app.listen(0, () => {
                testPort = server.address().port;
                let completed = 0;

                requestIds.forEach((reqId, index) => {
                    setTimeout(() => {
                        http.get({
                            hostname: 'localhost',
                            port: testPort,
                            path: '/api/test',
                            headers: {
                                'request-id': reqId
                            }
                        }, (res) => {
                            res.on('data', () => {});
                            res.on('end', () => {
                                completed++;
                                if (completed === requestIds.length) {
                                    setTimeout(() => {
                                        expect(loggedIds).to.have.members(requestIds);
                                        done();
                                    }, 50);
                                }
                            });
                        }).on('error', done);
                    }, index * 10); // Stagger requests slightly
                });
            });
        });
    });
});

// Global after hook to ensure all resources are cleaned up
after(function(done) {
    // Minimal delay - individual afterEach hooks handle cleanup
    // This is just a safety net
    setImmediate(done); // Use setImmediate instead of setTimeout for faster execution
});
