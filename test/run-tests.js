#!/usr/bin/env node
// Test runner wrapper that ensures process exits even with open handles
// This prevents CI from hanging

const { spawn } = require('child_process');
const path = require('path');

const mochaPath = require.resolve('mocha/bin/mocha');
const testFiles = path.join(__dirname, '*.spec.js');

const args = [
    testFiles,
    '--timeout', '10000',
    '--exit',
    '--reporter', 'spec'
];

console.log('Running tests with forced exit...');

const mocha = spawn('node', [mochaPath, ...args], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
});

let hasExited = false;

// Safety timeout - force exit after 7 minutes (420 seconds)
const safetyTimeout = setTimeout(() => {
    if (!hasExited) {
        console.error('\n⚠️  Tests exceeded maximum time (7 minutes), forcing exit...');
        mocha.kill('SIGTERM');
        setTimeout(() => {
            if (!hasExited) {
                console.error('Force killing test process...');
                mocha.kill('SIGKILL');
                process.exit(1);
            }
        }, 3000);
    }
}, 420000); // 7 minutes

mocha.on('exit', (code) => {
    hasExited = true;
    clearTimeout(safetyTimeout);
    const exitCode = code || 0;
    
    // Force exit after a short delay to allow any pending operations
    setTimeout(() => {
        console.log('\n✓ Tests completed, exiting...');
        process.exit(exitCode);
    }, 500);
});

mocha.on('error', (err) => {
    hasExited = true;
    clearTimeout(safetyTimeout);
    console.error('Failed to start test process:', err);
    process.exit(1);
});

// Handle process signals
process.on('SIGINT', () => {
    mocha.kill('SIGTERM');
    setTimeout(() => process.exit(1), 1000);
});

process.on('SIGTERM', () => {
    mocha.kill('SIGTERM');
    setTimeout(() => process.exit(1), 1000);
});
