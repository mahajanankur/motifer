const chai = require('chai');
const expect = chai.expect;
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { ExpressLoggerFactory, LoggerFactory } = require('../index');
const { winstonLoggerClient } = require('../winstonClient');
const fs = require('fs');
const path = require('path');

describe('Memory Leak and Resource Management Tests', () => {
    const testLogDir = path.join(__dirname, 'test-logs');

    beforeEach(() => {
        if (!fs.existsSync(testLogDir)) {
            fs.mkdirSync(testLogDir, { recursive: true });
        }
    });

    afterEach(() => {
        // Clean up
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

    describe('Logger Instance Management', () => {
        it('should not create memory leaks with multiple logger instances', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            const loggers = [];

            // Create many logger instances
            for (let i = 0; i < 100; i++) {
                const Logger = new LoggerFactory(`service-${i}`, 'info');
                const logger = Logger.getLogger(`file-${i}.js`);
                loggers.push(logger);
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 50MB for 100 loggers)
            expect(memoryIncrease).to.be.below(50 * 1024 * 1024);
        });

        it('should properly clean up file transports', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'test.log'),
                level: 'info'
            }];

            const logger1 = winstonLoggerClient('info', options);
            logger1.info('Test message 1');

            // Close logger
            logger1.close();

            // Create new logger with same file
            setTimeout(() => {
                const logger2 = winstonLoggerClient('info', options);
                logger2.info('Test message 2');
                logger2.close();

                setTimeout(() => {
                    // File should still be accessible
                    const logContent = fs.readFileSync(options[0].filename, 'utf8');
                    expect(logContent).to.include('Test message 1');
                    expect(logContent).to.include('Test message 2');
                    done();
                }, 100);
            }, 100);
        });
    });

    describe('Express Context Cleanup', () => {
        it('should not leak context between requests', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);

            const requestIds = new Set();
            let server;

            app.get('/api/test', (req, res) => {
                requestIds.add(req.id);
                res.json({ requestId: req.id });
            });

            server = app.listen(0, () => {
                const testPort = server.address().port;
                let completed = 0;
                const totalRequests = 10;

                for (let i = 0; i < totalRequests; i++) {
                    http.get(`http://localhost:${testPort}/api/test`, (res) => {
                        res.on('data', () => {});
                        res.on('end', () => {
                            completed++;
                            if (completed === totalRequests) {
                                // Each request should have unique ID
                                expect(requestIds.size).to.equal(totalRequests);
                                server.close(done);
                            }
                        });
                    }).on('error', (err) => {
                        server.close(() => done(err));
                    });
                }
            });
        });

        it('should handle context cleanup on request errors', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.get('/api/test', (req, res) => {
                logger.info('Before error');
                // Simulate error
                res.destroy();
            });

            const server = app.listen(0, () => {
                const testPort = server.address().port;

                const req = http.get(`http://localhost:${testPort}/api/test`, () => {});
                req.on('error', () => {
                    // Error is expected
                });

                setTimeout(() => {
                    server.close(done);
                }, 100);
            });
        });
    });

    describe('Event Listener Management', () => {
        it('should not accumulate event listeners on repeated requests', (done) => {
            const app = express();
            app.use(bodyParser.json());
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);

            let initialListenerCount = 0;
            let server;

            app.get('/api/test', (req, res) => {
                res.json({ success: true });
            });

            server = app.listen(0, () => {
                const testPort = server.address().port;

                // Get initial listener count
                http.get(`http://localhost:${testPort}/api/test`, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        initialListenerCount = process.listenerCount ? 
                            process.listenerCount('uncaughtException') : 0;

                        // Make many requests
                        let completed = 0;
                        for (let i = 0; i < 50; i++) {
                            http.get(`http://localhost:${testPort}/api/test`, (res) => {
                                res.on('data', () => {});
                                res.on('end', () => {
                                    completed++;
                                    if (completed === 50) {
                                        const finalListenerCount = process.listenerCount ? 
                                            process.listenerCount('uncaughtException') : 0;
                                        
                                        // Listener count should not increase significantly
                                        expect(finalListenerCount).to.be.at.most(initialListenerCount + 5);
                                        server.close(done);
                                    }
                                });
                            }).on('error', () => {
                                completed++;
                                if (completed === 50) {
                                    server.close(done);
                                }
                            });
                        }
                    });
                }).on('error', (err) => {
                    server.close(() => done(err));
                });
            });
        });
    });

    describe('File Handle Management', () => {
        it('should properly close file handles after logging', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'handle-test.log'),
                level: 'info'
            }];

            const logger = winstonLoggerClient('info', options);

            // Write many log entries
            for (let i = 0; i < 100; i++) {
                logger.info(`Test message ${i}`);
            }

            // Close logger
            logger.close();

            setTimeout(() => {
                // File should be readable (handle closed properly)
                const logContent = fs.readFileSync(options[0].filename, 'utf8');
                expect(logContent).to.include('Test message 0');
                expect(logContent).to.include('Test message 99');
                done();
            }, 200);
        });

        it('should handle file rotation without leaks', (done) => {
            const options = [{
                rotate: true,
                filename: 'rotation-test-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HHmm',
                dirname: testLogDir,
                maxSize: '1k', // Small size to trigger rotation quickly
                maxFiles: '5'
            }];

            const logger = winstonLoggerClient('info', options);

            // Write enough to trigger rotation
            for (let i = 0; i < 200; i++) {
                logger.info(`Rotation test message ${i} - ${'x'.repeat(50)}`);
            }

            setTimeout(() => {
                logger.close();
                
                setTimeout(() => {
                    // Check that files were created and can be read
                    const files = fs.readdirSync(testLogDir).filter(f => f.includes('rotation-test'));
                    expect(files.length).to.be.greaterThan(0);
                    done();
                }, 500);
            }, 500);
        });
    });

    describe('Large Payload Handling', () => {
        it('should handle large request bodies without memory issues', (done) => {
            const app = express();
            app.use(bodyParser.json({ limit: '10mb' }));
            const Logger = new ExpressLoggerFactory('test-app', 'info', app);
            const logger = Logger.getLogger(__filename);

            app.post('/api/large', (req, res) => {
                logger.info('Large payload received');
                res.json({ received: true });
            });

            const server = app.listen(0, () => {
                const testPort = server.address().port;
                const largeData = { data: 'x'.repeat(1024 * 1024) }; // 1MB
                const postData = JSON.stringify(largeData);

                const req = http.request({
                    hostname: 'localhost',
                    port: testPort,
                    path: '/api/large',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        server.close(done);
                    });
                });

                req.on('error', (err) => {
                    server.close(() => done(err));
                });

                req.write(postData);
                req.end();
            });
        });
    });

    describe('Concurrent Logger Operations', () => {
        it('should handle concurrent logging operations safely', (done) => {
            const options = [{
                filename: path.join(testLogDir, 'concurrent.log'),
                level: 'info'
            }];

            const logger = winstonLoggerClient('info', options);
            let completed = 0;
            const total = 100;

            // Concurrent log operations
            for (let i = 0; i < total; i++) {
                setImmediate(() => {
                    logger.info(`Concurrent message ${i}`);
                    completed++;
                    if (completed === total) {
                        setTimeout(() => {
                            logger.close();
                            const logContent = fs.readFileSync(options[0].filename, 'utf8');
                            // All messages should be logged
                            for (let j = 0; j < total; j++) {
                                expect(logContent).to.include(`Concurrent message ${j}`);
                            }
                            done();
                        }, 200);
                    }
                });
            }
        });
    });
});
