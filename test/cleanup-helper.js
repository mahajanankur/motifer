// Helper for Windows-safe file cleanup
// Handles file locking issues on Windows when Winston loggers have open file handles

const fs = require('fs');
const path = require('path');

/**
 * Safely remove a directory and its contents, handling Windows file locking
 * @param {string} dirPath - Directory path to remove
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 100)
 */
function safeRemoveDir(dirPath, maxRetries = 3, retryDelay = 100) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    const attemptRemove = (retries) => {
        try {
            // Try to remove files first
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                files.forEach(file => {
                    const filePath = path.join(dirPath, file);
                    try {
                        const stat = fs.statSync(filePath);
                        if (stat.isDirectory()) {
                            safeRemoveDir(filePath, maxRetries, retryDelay);
                        } else {
                            // On Windows, files might be locked - try to unlink
                            try {
                                fs.unlinkSync(filePath);
                            } catch (err) {
                                // If file is locked, ignore - it will be cleaned up later
                                // or by the OS when the process exits
                                if (err.code !== 'EPERM' && err.code !== 'EBUSY') {
                                    // Only log non-locking errors in development
                                    if (process.env.NODE_ENV === 'development') {
                                        console.warn(`Could not delete ${filePath}: ${err.message}`);
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        // Ignore individual file errors during cleanup
                    }
                });
            }

            // Try to remove directory
            try {
                fs.rmSync(dirPath, { recursive: true, force: true });
            } catch (err) {
                // If directory removal fails due to locked files, that's OK
                // The files will be cleaned up when the process exits
                if (err.code !== 'EPERM' && err.code !== 'EBUSY' && err.code !== 'ENOTEMPTY') {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Could not remove directory ${dirPath}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            // If we have retries left and it's a Windows locking error, retry
            if (retries > 0 && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'ENOTEMPTY')) {
                setTimeout(() => {
                    attemptRemove(retries - 1);
                }, retryDelay * (maxRetries - retries + 1));
            }
            // Otherwise, ignore - cleanup failures shouldn't fail tests
        }
    };

    attemptRemove(maxRetries);
}

/**
 * Close all Winston logger transports
 * @param {object} logger - Winston logger instance
 */
function closeLogger(logger) {
    if (logger && logger.close) {
        try {
            logger.close();
        } catch (err) {
            // Ignore errors when closing
        }
    }
    if (logger && logger.transports) {
        logger.transports.forEach(transport => {
            if (transport.close) {
                try {
                    transport.close();
                } catch (err) {
                    // Ignore errors
                }
            }
        });
    }
}

module.exports = {
    safeRemoveDir,
    closeLogger
};
