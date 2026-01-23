# Getting Started with Motifer

Welcome to Motifer! This guide will help you get up and running in minutes. 🚀

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Express Setup](#express-setup)
- [Non-Express Setup](#non-express-setup)
- [Configuration](#configuration)
- [Next Steps](#next-steps)

## Installation

### Prerequisites

- **Node.js** >= 12.0.0
- **npm** >= 6.0.0 (or yarn)

### Install Motifer

```bash
npm install motifer
```

Or with yarn:

```bash
yarn add motifer
```

## Quick Start

### 30-Second Setup (Express)

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();
app.use(bodyParser.json());

// Initialize Motifer
const Logger = new ExpressLoggerFactory('my-app', 'info', app);
const logger = Logger.getLogger(__filename);

// Use in your routes
app.get('/api/hello', (req, res) => {
  logger.info('Hello endpoint called');
  res.json({ message: 'Hello, World!' });
});

app.listen(3000, () => {
  logger.info('Server running on port 3000');
});
```

**That's it!** Your logs are now structured and traceable. 🎉

## Express Setup

### Step-by-Step Guide

#### 1. Install Dependencies

```bash
npm install express body-parser motifer
```

#### 2. Create Your App

Create a file `app.js`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();
```

#### 3. Configure Body Parser

**Important:** Body parser must be configured **before** Motifer.

```javascript
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

#### 4. Initialize Motifer

```javascript
const Logger = new ExpressLoggerFactory(
  'my-awesome-app',  // Your app name
  'debug',           // Log level (info, debug, warn, error)
  app                // Express instance
);
```

#### 5. Create Logger Instance

```javascript
const logger = Logger.getLogger(__filename);
```

#### 6. Use in Your Routes

```javascript
app.get('/api/users', (req, res) => {
  logger.info('Fetching users');
  
  // Your business logic
  const users = getUsers();
  
  logger.debug('Users retrieved:', { count: users.length });
  res.json(users);
});
```

#### 7. Start Your Server

```javascript
app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

### Complete Example

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { ExpressLoggerFactory } = require('motifer');

const app = express();

// 1. Body parser (must be before Motifer)
app.use(bodyParser.json());

// 2. Initialize Motifer
const Logger = new ExpressLoggerFactory('ecommerce-api', 'debug', app);
const logger = Logger.getLogger(__filename);

// 3. Routes
app.get('/api/products', async (req, res) => {
  logger.info('Fetching products');
  logger.debug('Query params:', req.query);
  
  try {
    const products = await fetchProducts();
    logger.info(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  logger.info('Creating order', { userId: req.body.userId });
  
  try {
    const order = await createOrder(req.body);
    logger.info('Order created', { orderId: order.id });
    res.json(order);
  } catch (error) {
    logger.error('Order creation failed', error);
    res.status(400).json({ error: error.message });
  }
});

// 4. Start server
app.listen(3000, () => {
  logger.info('E-commerce API started on port 3000');
});
```

## Non-Express Setup

For background services, CLI tools, or non-web applications:

### Basic Setup

```javascript
const { LoggerFactory } = require('motifer');

// Simple setup
const Logger = new LoggerFactory('background-worker', 'info');
const logger = Logger.getLogger(__filename);

logger.info('Worker started');
logger.error('Processing failed', error);
```

### With File Logging

```javascript
const { LoggerFactory } = require('motifer');

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

// Use logger
logger.info('Worker processing started');
```

### Complete Background Service Example

```javascript
const { LoggerFactory } = require('motifer');

// Configure logger
const logOptions = [{
  rotate: true,
  filename: 'email-service-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  dirname: './logs',
  maxSize: '50m',
  maxFiles: '7d'
}];

const Logger = new LoggerFactory('email-service', 'info', logOptions);
const logger = Logger.getLogger(__filename);

// Background service
async function processEmails() {
  logger.info('Email processing started');
  
  try {
    const emails = await fetchPendingEmails();
    logger.debug(`Found ${emails.length} emails to process`);
    
    for (const email of emails) {
      try {
        await sendEmail(email);
        logger.info(`Email sent successfully`, { 
          to: email.to, 
          subject: email.subject 
        });
      } catch (error) {
        logger.error(`Failed to send email`, { 
          to: email.to, 
          error: error.message 
        });
      }
    }
    
    logger.info('Email processing completed');
  } catch (error) {
    logger.error('Email processing failed', error);
  }
}

// Run service
processEmails();
```

## Configuration

### Log Levels

Supported log levels (in order of severity):

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages (default)
- `http` - HTTP-related messages
- `verbose` - Verbose messages
- `debug` - Debug messages
- `silly` - Silly messages

### File Appender Configuration

```javascript
const options = [{
  // Basic
  filename: 'app.log',              // Log filename
  dirname: './logs',                 // Log directory
  
  // Rotation
  rotate: true,                      // Enable rotation
  datePattern: 'YYYY-MM-DD',        // Date pattern
  frequency: '1d',                   // Rotation frequency
  
  // Size and retention
  maxSize: '20m',                   // Max file size
  maxFiles: '14d',                  // Retention period
  archived: true                     // Compress archives
  
  // Level
  level: 'info'                      // Log level for this appender
}];
```

### Multiple Appenders

```javascript
const options = [
  // Error logs only
  {
    level: 'error',
    filename: 'errors.log',
    dirname: './logs'
  },
  // Warning logs
  {
    level: 'warn',
    filename: 'warnings.log',
    dirname: './logs'
  },
  // All logs with rotation
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

## Next Steps

### 1. Explore Log Patterns

Learn about the structured log patterns Motifer uses:
- [Request Logs](README.md#request-logs)
- [Service Logs](README.md#service-logs)
- [Response Logs](README.md#response-logs)

### 2. Set Up File Logging

Configure file appenders for production:
- [File Appender Options](README.md#file-appender-options)
- [Rotation Configuration](README.md#rotation-options)

### 3. Integrate with Logstash

Use the provided Logstash configuration:
- [Logstash Configuration](logstash.config)

### 4. Add Elastic APM

Monitor your application performance:
- [APM Integration](README.md#elastic-apm-integration)

### 5. Read the Full Documentation

- [Complete README](README.md)
- [API Reference](README.md#api-reference)
- [Best Practices](README.md#best-practices)
- [Troubleshooting](README.md#troubleshooting)

## Common Patterns

### Error Handling

```javascript
app.get('/api/data', async (req, res) => {
  try {
    const data = await fetchData();
    logger.info('Data fetched successfully');
    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Request Context

```javascript
app.get('/api/users/:id', async (req, res) => {
  logger.info('Fetching user', { userId: req.params.id });
  
  const user = await getUser(req.params.id);
  
  if (!user) {
    logger.warn('User not found', { userId: req.params.id });
    return res.status(404).json({ error: 'User not found' });
  }
  
  logger.debug('User retrieved', { userId: user.id, email: user.email });
  res.json(user);
});
```

### Background Jobs

```javascript
async function processQueue() {
  logger.info('Queue processing started');
  
  while (true) {
    try {
      const job = await getNextJob();
      if (!job) {
        await sleep(1000);
        continue;
      }
      
      logger.debug('Processing job', { jobId: job.id });
      await processJob(job);
      logger.info('Job completed', { jobId: job.id });
    } catch (error) {
      logger.error('Job processing failed', error);
    }
  }
}
```

## Troubleshooting

### Request ID is null

**Problem:** Request ID shows as `null` in logs.

**Solution:** Make sure Motifer is initialized **before** your routes:

```javascript
// ✅ Correct
app.use(bodyParser.json());
const Logger = new ExpressLoggerFactory('app', 'info', app);
app.use('/api', routes);

// ❌ Wrong
app.use('/api', routes);
const Logger = new ExpressLoggerFactory('app', 'info', app);
```

### Request body is empty

**Problem:** Request body shows as `{}` in logs.

**Solution:** Initialize `body-parser` **before** Motifer:

```javascript
// ✅ Correct
app.use(bodyParser.json());
const Logger = new ExpressLoggerFactory('app', 'info', app);

// ❌ Wrong
const Logger = new ExpressLoggerFactory('app', 'info', app);
app.use(bodyParser.json());
```

### Logs not in files

**Problem:** Console logs work but file logs don't appear.

**Solution:** Check directory permissions and ensure directory exists:

```javascript
const options = [{
  filename: 'app.log',
  dirname: './logs' // Make sure this directory exists and is writable
}];
```

## Need Help?

- 📖 Read the [full documentation](README.md)
- 💬 Ask questions in [GitHub Discussions](https://github.com/mahajanankur/motifer/discussions)
- 🐛 Report bugs in [GitHub Issues](https://github.com/mahajanankur/motifer/issues)
- ⭐ Star the repo if you find it helpful!

---

**Happy Logging!** 🎉
