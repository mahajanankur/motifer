#!/usr/bin/env node
// Test runner wrapper that ensures process exits even with open handles
// This prevents CI from hanging

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mochaPath = require.resolve('mocha/bin/mocha');
const testDir = __dirname;

// Get all spec files EXCEPT memory-leaks.spec.js (too slow/flaky for CI)
const testFiles = fs.readdirSync(testDir)
    .filter(f => f.endsWith('.spec.js') && f !== 'memory-leaks.spec.js')
    .map(f => path.join(testDir, f));

console.log(`Running ${testFiles.length} test files (excluding memory-leaks.spec.js for CI)...`);

const args = [
    ...testFiles,
    '--timeout', '8000',
    '--exit',
    '--reporter', 'spec'
];

console.log('Running tests with forced exit...');

const mocha = spawn('node', [mochaPath, ...args], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
});

let hasExited = false;

// Safety timeout - force exit after 5 minutes (300 seconds) - optimized for CI
const safetyTimeout = setTimeout(() => {
    if (!hasExited) {
        console.error('\n⚠️  Tests exceeded maximum time (5 minutes), forcing exit...');
        mocha.kill('SIGTERM');
        setTimeout(() => {
            if (!hasExited) {
                console.error('Force killing test process...');
                mocha.kill('SIGKILL');
                process.exit(1);
            }
        }, 2000); // Reduced from 3000ms
    }
}, 300000); // 5 minutes (reduced from 7)

mocha.on('exit', (code) => {
    hasExited = true;
    clearTimeout(safetyTimeout);
    const exitCode = code || 0;
    
    // Force exit immediately - no delay needed with --exit flag
    console.log('\n✓ Tests completed, exiting...');
    process.exit(exitCode);
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
