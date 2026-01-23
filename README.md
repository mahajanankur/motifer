<div align="center">

# 🚀 Motifer

### **The Ultimate Structured Logging Solution for Node.js & Express**

[![npm version](https://img.shields.io/npm/v/motifer.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/motifer)
[![npm downloads](https://img.shields.io/npm/dm/motifer.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/motifer)
[![GitHub stars](https://img.shields.io/github/stars/mahajanankur/motifer.svg?style=for-the-badge&logo=github)](https://github.com/mahajanankur/motifer)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![CI](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/ci.yml?branch=master&label=CI&style=for-the-badge&logo=github-actions)](https://github.com/mahajanankur/motifer/actions/workflows/ci.yml)
[![Security Scan](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/security.yml?branch=master&label=Security&style=for-the-badge&logo=github-actions)](https://github.com/mahajanankur/motifer/actions/workflows/security.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/codeql.yml?branch=master&label=CodeQL&style=for-the-badge&logo=github)](https://github.com/mahajanankur/motifer/actions/workflows/codeql.yml)

**✨ Production-Ready | 🔍 Request Tracing | 📊 Logstash Compatible | 🎯 Zero Configuration**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## 🌟 Why Motifer?

**Tired of scattered, inconsistent logs that make debugging a nightmare?** Motifer transforms your logging experience with:

- 🎯 **Automatic Request ID Tracking** - Every request gets a unique UUID v4, making it trivial to trace requests across microservices
- 📋 **Structured Log Patterns** - Consistent, parseable logs that work seamlessly with Logstash, Elasticsearch, and CloudTrail
- 🚀 **Zero Boilerplate** - Set up in 30 seconds, works out of the box
- 🔄 **Smart File Rotation** - Automatic log rotation with compression and archival
- 🎨 **Express.js Native** - Built specifically for Express with automatic request/response logging
- 🔍 **Microservice-Ready** - Request ID chaining across service boundaries
- 📊 **Elastic APM Integration** - Built-in support for application performance monitoring

---

## ✨ Features

### 🎯 Core Capabilities

- ✅ **Pattern Validation** - Enforce consistent log patterns across your entire application
- ✅ **Request/Response Logging** - Automatic HTTP request and response logging with full context
- ✅ **Unique Request IDs** - UUID v4 tracking for complete request lifecycle visibility
- ✅ **Multi-Level Logging** - Support for info, debug, warn, error, and custom log levels
- ✅ **File Rotation** - Time-based and size-based log rotation with compression
- ✅ **Multiple Appenders** - Configure different log files for different log levels
- ✅ **Logstash Compatible** - Pre-configured patterns for seamless Logstash integration
- ✅ **CloudTrail Support** - Ready for AWS CloudTrail logging
- ✅ **Elastic APM** - Built-in integration for application performance monitoring
- ✅ **Express Middleware** - Automatic Express.js integration with zero configuration

---

## 🚀 Quick Start

### Installation

```bash
npm install motifer
```

### Basic Usage (Express)

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();
app.use(bodyParser.json());

// Initialize Motifer (do this before your routes!)
const Logger = new ExpressLoggerFactory('my-app', 'debug', app);

// Use in your routes
const logger = Logger.getLogger(__filename);

app.get('/api/users', (req, res) => {
  logger.info('Fetching users');
  logger.debug('Query params:', req.query);
  
  // Your business logic here
  res.json({ users: [] });
});
```

### Basic Usage (Non-Express)

```javascript
const { LoggerFactory } = require('motifer');

const Logger = new LoggerFactory('my-service', 'info');
const logger = Logger.getLogger(__filename);

logger.info('Service started successfully');
logger.error('Something went wrong', error);
```

**That's it!** Your logs are now structured, traceable, and production-ready. 🎉

---

## 📅 Versioning

Motifer uses **date-based versioning** in the format `YY.M.S`:
- **YY**: Last two digits of the year (e.g., 25 for 2025)
- **M**: Month (1-12, no leading zeros)
- **S**: Sequence number for releases in that month (1, 2, 3, ...)

**Examples:**
- `26.1.1` - First release in January 2026
- `26.1.2` - Second release in January 2026
- `26.2.1` - First release in February 2026

This makes it easy to identify when a version was released and ensures chronological ordering. For detailed version history, see [CHANGELOG.md](CHANGELOG.md).

---

## 📖 Documentation

### Table of Contents

- [Installation](#-installation)
- [Express Setup](#-express-setup)
- [Non-Express Setup](#-non-express-setup)
- [Configuration Options](#-configuration-options)
- [Log Patterns](#-log-patterns)
- [Advanced Features](#-advanced-features)
- [Examples](#-examples)
- [API Reference](#-api-reference)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Express Setup

### Step 1: Install Dependencies

```bash
npm install motifer express body-parser
```

### Step 2: Initialize Motifer

**Important:** Initialize Motifer **after** `body-parser` but **before** your routes.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();

// 1. Configure body parser first
app.use(bodyParser.json());

// 2. Initialize Motifer
const Logger = new ExpressLoggerFactory(
  'my-awesome-app',  // Service name
  'debug',           // Log level
  app,                // Express instance
  [/* options */]     // Optional: file appenders
);

// 3. Use logger in your routes
const logger = Logger.getLogger(__filename);

app.get('/api/status', (req, res) => {
  logger.info('Status check requested');
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

### Request ID Chaining (Microservices)

Motifer automatically handles request ID propagation across microservices:

```javascript
// Service A - Generates request ID
app.get('/api/users', (req, res) => {
  // Request ID: 47de6d41-6dbd-44fc-9732-e28823755b58
  logger.info('Fetching users');
  
  // Forward to Service B with same request ID
  axios.get('http://service-b/api/data', {
    headers: { 'request-id': req.id }
  });
});

// Service B - Receives and uses the same request ID
// All logs will have the same request ID, making tracing effortless!
```

---

## 🔧 Non-Express Setup

For non-Express applications or background services:

```javascript
const { LoggerFactory } = require('motifer');

// Simple setup
const Logger = new LoggerFactory('background-worker', 'info');
const logger = Logger.getLogger(__filename);

// With file logging
const options = [{
  rotate: true,
  filename: 'worker-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: './logs',
  maxSize: '20m',
  maxFiles: '14d'
}];

const Logger = new LoggerFactory('background-worker', 'info', options);
const logger = Logger.getLogger(__filename);

logger.info('Worker started');
logger.error('Processing failed', error);
```

---

## ⚙️ Configuration Options

### File Appender Options

```javascript
const options = [{
  // Basic options
  filename: 'app-%DATE%.log',        // Log filename (supports %DATE% placeholder)
  dirname: './logs',                  // Directory for log files
  level: 'info',                      // Log level for this appender
  
  // Rotation options
  rotate: true,                       // Enable file rotation
  datePattern: 'YYYY-MM-DD',         // Date pattern (moment.js format)
  frequency: '1d',                    // Rotation frequency (e.g., '5m', '2h', '1d')
  
  // Size and retention
  maxSize: '20m',                     // Max file size (supports: b, kb, mb, gb)
  maxFiles: '14d',                    // Retention period (e.g., '14d', '30', '100')
  archived: true                      // Compress archived files
}];
```

### Multiple File Appenders

```javascript
const options = [
  {
    level: 'error',
    filename: 'errors.log',
    dirname: './logs'
  },
  {
    level: 'warn',
    filename: 'warnings.log',
    dirname: './logs'
  },
  {
    rotate: true,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    dirname: './logs',
    maxSize: '50m',
    maxFiles: '30d'
  }
];

const Logger = new ExpressLoggerFactory('my-app', 'debug', app, options);
```

### Date Pattern Examples

| Pattern | Description | Example Output |
|---------|-------------|----------------|
| `YYYY-MM-DD` | Daily rotation | `2024-01-15` |
| `YYYY-MM-DD-HH` | Hourly rotation | `2024-01-15-14` |
| `YYYY-MM-DD-HHmm` | Every 5 minutes | `2024-01-15-1430` |
| `YYYY-MM` | Monthly rotation | `2024-01` |

---

## 📋 Log Patterns

Motifer uses structured log patterns that are easy to parse and search.

### Request Logs

```
TIMESTAMP [request] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [METHOD] [IP] [PATH] [BODY]
```

**Examples:**
```
# GET request (no body)
2024-01-15T10:30:45.123Z [request] [47de6d41-6dbd-44fc-9732-e28823755b58] [my-app] [INFO] [GET] [::1] [/api/users?page=1] [{}]

# POST request with JSON body
2024-01-15T10:30:46.234Z [request] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] [my-app] [INFO] [POST] [192.168.1.100] [/api/users] [{"name":"John Doe","email":"john@example.com","age":30}]

# PUT request with body
2024-01-15T10:30:47.345Z [request] [b2c3d4e5-f6a7-8901-bcde-f12345678901] [my-app] [INFO] [PUT] [10.0.0.1] [/api/users/123] [{"email":"newemail@example.com"}]
```

### Service Logs

```
TIMESTAMP [service] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [FILENAME] MESSAGE
```

**Example:**
```
2024-01-15T10:30:45.125Z [service] [47de6d41-6dbd-44fc-9732-e28823755b58] [my-app] [INFO] [users.controller.js] Fetching users from database
```

### Response Logs

```
TIMESTAMP [response] [REQUEST_ID] [APP_NAME] [LOG_LEVEL] [METHOD] [IP] [PATH] [STATUS] [SIZE] [TIME] [USER_AGENT]
```

**Example:**
```
2024-01-15T10:30:45.250Z [response] [47de6d41-6dbd-44fc-9732-e28823755b58] [my-app] [INFO] [GET] [::1] [/api/users?page=1] [200] [1024] [125.5 ms] [Mozilla/5.0...]
```

---

## 🎨 Advanced Features

### Elastic APM Integration

```javascript
const { ApmFactory } = require('motifer');

// Initialize APM (do this at the very start of your app)
ApmFactory({
  serviceName: 'my-awesome-app',
  apmServerUrl: 'https://apm-server.example.com',
  secretToken: 'your-secret-token',
  environment: 'production',
  logLevel: 'error'
});

// Errors are automatically captured
logger.error('Something went wrong', error); // Automatically sent to APM
```

### Standard Log Levels

```javascript
const logger = Logger.getLogger(__filename);

// Standard levels
logger.info('Information message');
logger.debug('Debug message');
logger.warn('Warning message');
logger.error('Error message');
```

### Logging with Context

```javascript
// Simple message
logger.info('User created');

// Message with formatted arguments
logger.debug('Processing user:', { id: 123, name: 'John' });

// Error with stack trace
logger.error(error); // Automatically includes stack trace

// Multiple arguments
logger.info('User', user.id, 'performed action', action.type);
```

---

## 📚 Examples

### Complete Express Application

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();
app.use(bodyParser.json());

// Configure logger with file rotation
const logOptions = [{
  rotate: true,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: './logs',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
}, {
  level: 'error',
  filename: 'errors.log',
  dirname: './logs'
}];

const Logger = new ExpressLoggerFactory('ecommerce-api', 'debug', app, logOptions);
const logger = Logger.getLogger(__filename);

// Routes
app.get('/api/products', async (req, res) => {
  logger.info('Fetching products');
  logger.debug('Query parameters:', req.query);
  
  try {
    const products = await fetchProducts(req.query);
    logger.info(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

### Background Service

```javascript
const { LoggerFactory } = require('motifer');

const Logger = new LoggerFactory('email-worker', 'info', [{
  rotate: true,
  filename: 'worker-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  dirname: './logs'
}]);

const logger = Logger.getLogger(__filename);

async function processEmails() {
  logger.info('Starting email processing');
  
  try {
    const emails = await fetchEmails();
    logger.debug(`Processing ${emails.length} emails`);
    
    for (const email of emails) {
      await sendEmail(email);
      logger.info(`Email sent to ${email.to}`);
    }
    
    logger.info('Email processing completed');
  } catch (error) {
    logger.error('Email processing failed', error);
  }
}

processEmails();
```

---

## 📖 API Reference

### `ExpressLoggerFactory(service, level, express, options)`

Creates a logger factory for Express.js applications.

**Parameters:**
- `service` (string, required) - Application/service name
- `level` (string, required) - Log level (info, debug, warn, error, etc.)
- `express` (object, required) - Express application instance
- `options` (array, optional) - File appender configuration

**Returns:** Logger factory object with `getLogger(filename)` method

### `LoggerFactory(service, level, options)`

Creates a logger factory for non-Express applications.

**Parameters:**
- `service` (string, required) - Application/service name
- `level` (string, optional) - Log level (default: 'info')
- `options` (array, optional) - File appender configuration

**Returns:** Logger factory object with `getLogger(filename)` method

### `ApmFactory(configObject)`

Initializes Elastic APM integration.

**Parameters:**
- `configObject.serviceName` (string, required) - Service name
- `configObject.apmServerUrl` (string, required) - APM server URL
- `configObject.secretToken` (string, required) - APM secret token
- `configObject.environment` (string, optional) - Environment (default: 'production')
- `configObject.logLevel` (string, optional) - APM log level (default: 'error')

### Logger Methods

```javascript
logger.info(...args)      // Log info message
logger.debug(...args)     // Log debug message
logger.warn(...args)      // Log warning message
logger.error(...args)     // Log error message
```

---

## 🎯 Best Practices

### 1. Initialize Early

```javascript
// ✅ Good: Initialize at the start
const app = express();
app.use(bodyParser.json());
const Logger = new ExpressLoggerFactory('app', 'info', app);

// ❌ Bad: Initialize after routes
app.use('/api', routes);
const Logger = new ExpressLoggerFactory('app', 'info', app); // Too late!
```

### 2. Use Appropriate Log Levels

```javascript
// ✅ Good
logger.error('Database connection failed', error); // For errors
logger.warn('Rate limit approaching');           // For warnings
logger.info('User logged in');                    // For important events
logger.debug('Processing request', data);        // For debugging

// ❌ Bad
logger.info('Database connection failed', error); // Should be error
logger.error('User logged in');                   // Should be info
```

### 3. Include Context

```javascript
// ✅ Good
logger.info('Order created', { orderId: order.id, userId: user.id });
logger.error('Payment failed', { orderId: order.id, error: error.message });

// ❌ Bad
logger.info('Order created'); // Missing context
```

### 4. Use Request IDs

```javascript
// ✅ Good: Request ID is automatically included in Express apps
app.get('/api/users', (req, res) => {
  logger.info('Fetching users'); // Request ID automatically included
});

// For non-Express, you can manually track context
```

### 5. Configure File Rotation

```javascript
// ✅ Good: Proper rotation configuration
const options = [{
  rotate: true,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
}];

// ❌ Bad: No rotation (files will grow indefinitely)
const options = [{
  filename: 'app.log' // No rotation!
}];
```

---

## 🔍 Troubleshooting

### Request ID is undefined

**Problem:** Request ID shows as `null` in logs.

**Solution:** Make sure you initialize `ExpressLoggerFactory` **before** your routes:

```javascript
// ✅ Correct order
app.use(bodyParser.json());
const Logger = new ExpressLoggerFactory('app', 'info', app);
app.use('/api', routes);
```

### Logs not appearing in files

**Problem:** Console logs work but file logs don't appear.

**Solution:** Check file permissions and directory existence:

```javascript
const options = [{
  filename: 'app.log',
  dirname: './logs' // Make sure this directory exists and is writable
}];
```

### Request body is empty in logs

**Problem:** Request body shows as `{}` in request logs.

**Solution:** Initialize `body-parser` **before** Motifer:

```javascript
// ✅ Correct
app.use(bodyParser.json());
const Logger = new ExpressLoggerFactory('app', 'info', app);

// ❌ Wrong
const Logger = new ExpressLoggerFactory('app', 'info', app);
app.use(bodyParser.json());
```

---

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick start:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the need for better structured logging in Node.js applications
- Built for developers who value clean, traceable, and production-ready logging

---

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/mahajanankur/motifer?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/mahajanankur/motifer?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mahajanankur/motifer?style=flat-square)

**Active Development** • **Production Ready** • **Well Maintained**

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mahajanankur/motifer&type=Date)](https://star-history.com/#mahajanankur/motifer&Date)

---

## 💬 Community

- 🐛 **Found a bug?** [Open an issue](https://github.com/mahajanankur/motifer/issues)
- 💡 **Have a feature request?** [Open an issue](https://github.com/mahajanankur/motifer/issues)
- 📖 **Need help?** Check the [documentation](#-documentation) or [open a discussion](https://github.com/mahajanankur/motifer/discussions)
- 💬 **Want to chat?** Join our [Discussions](https://github.com/mahajanankur/motifer/discussions)

---

<div align="center">

**Made with ❤️ by [Ankur Mahajan](https://github.com/mahajanankur)**

**⭐ Star this repo if you find it helpful!**

[⬆ Back to Top](#-motifer)

</div>
