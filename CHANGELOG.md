# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Versioning Scheme

Motifer uses **date-based versioning** in the format `YY.M.S`:
- **YY**: Last two digits of the year (e.g., 25 for 2025)
- **M**: Month (1-12, no leading zeros - npm compatible)
- **S**: Sequence number for releases in that month (1, 2, 3, ...)

**Examples:**
- `26.1.1` - First release in January 2026
- `26.1.2` - Second release in January 2026
- `26.2.1` - First release in February 2026
- `27.1.1` - First release in January 2027

## [Unreleased]

### Planned
- TypeScript type definitions
- Enhanced documentation
- Performance optimizations
- Additional log transports

## [26.1.1] - 2026-01-23

### Added
- Comprehensive test suite (110 tests covering all functionality)
- Express integration tests
- Memory leak detection tests
- Edge case handling tests
- Complete functionality tests
- CI/CD workflows (GitHub Actions)
- Security scanning workflows
- CodeQL analysis
- Test wrapper script for CI optimization
- Windows-safe file cleanup helpers

### Changed
- **Versioning Scheme Update**: Switched from semantic versioning to date-based versioning (YY.M.S format)
- Enhanced documentation with new versioning scheme
- Updated all documentation to reflect new version format
- Version format adjusted to be npm-compatible (no leading zeros in month)
- Updated version to 26.1.1 (January 2026 release)
- Optimized CI pipeline (reduced from 15 to 6 test jobs)
- Improved error handling for null/undefined filename
- Made log level validation case-insensitive
- Enhanced file path error handling

### Fixed
- Fixed TypeError when filename is null/undefined in getLogger methods
- Fixed case-sensitive log level validation
- Fixed invalid file path handling in winstonClient
- Fixed test cleanup issues on Windows (EPERM errors)
- Fixed CI pipeline hanging issues
- Fixed package.json dependencies (moved chai to devDependencies)
- Fixed npm package size (reduced from 47.7kB to 14.2kB)

### Security
- All dependencies updated to latest compatible versions
- Zero security vulnerabilities (npm audit: 0 vulnerabilities)

### Migration Note
This release introduces the new date-based versioning scheme. Previous versions used semantic versioning (2.0.7, 2.0.6, etc.). Going forward, all releases will follow the YY.M.S format (npm-compatible, no leading zeros).

---

## Historical Versions (Pre-26.1.1)

The following versions used semantic versioning before the switch to date-based versioning:

## [2.0.7] - 2025-06-10

### Added
- Release notes for logging system updates

### Changed
- Enhanced documentation with release notes

## [2.0.6] - 2024-11-XX

### Changed
- Improved logging system

## [2.0.5] - 2024-11-20

### Fixed
- Upgraded Winston package to 2.15.0 to resolve build issues with transporters
- Multiple attempts to fix transporter build issues

## [2.0.2] - 2024-08-14

### Added
- Support for log level in file rotation options
- Fixed Winston version for stability

### Fixed
- File rotation now properly supports per-appender log levels
- Improved file rotation configuration

## [2.0.0] - 2024-01-02

### Added
- **Major Release**: Added support for Node.js 20
- Enhanced compatibility with latest Node.js versions

### Changed
- Updated dependencies for Node.js 20 compatibility

## [1.3.1] - 2023-06-30

### Added
- Comprehensive test cases and validations
- Improved code quality through testing

### Changed
- Enhanced validation logic
- Better error handling

## [1.3.0] - 2023-04-24

### Added
- **Enhancement**: Request ID chaining across microservices
- Support for propagating request IDs between services
- Improved microservice tracing capabilities

### Changed
- Enhanced request ID handling for distributed systems

## [1.2.6] - 2023-02-06

### Changed
- Improved log formatting

## [1.2.5] - 2022-05-12

### Fixed
- Removed "ms" postfix from response time in logs
- Cleaner response time formatting

## [1.2.4] - 2022-03-16

### Added
- Exposed APM client for custom traces and transactions
- Enhanced APM integration capabilities

### Changed
- Improved APM client accessibility for advanced use cases

## [1.2.3] - 2022-03-03

### Added
- **Major Feature**: Elastic APM support
- Integration with Elastic Application Performance Monitoring
- APM server configuration
- Automatic error capture to APM

### Changed
- Enhanced error tracking capabilities

## [1.2.2] - 2021-09-22

### Fixed
- Logging level bug fix
- Improved log level handling

### Changed
- Updated README documentation

## [1.2.1] - 2021-08-23

### Changed
- Updated README with multiple appender documentation

## [1.2.0] - 2021-08-21

### Added
- **Major Feature**: Multiple file appender support
- Support for multiple log files with different configurations
- Ability to configure different log files for different log levels
- APM index file preparation
- Enhanced options support for file appenders

### Changed
- Changed path configuration to options-based approach
- Improved file appender flexibility

## [1.1.9] - 2020-11-10

### Fixed
- Bug fix for requestId getting undefined in some contexts
- Improved context management for async operations
- Date rotation bug fix

### Changed
- Updated README for version 1.1.9

## [1.1.8] - 2020-XX-XX

### Changed
- Updated log rotation options
- Enhanced file rotation capabilities

## [1.1.7] - 2020-XX-XX

### Changed
- Updated README documentation

## [1.1.6] - 2020-XX-XX

### Added
- File rotation support
- Time-based and size-based log rotation

## [1.1.5] - 2020-XX-XX

### Added
- Varargs support in logger functions
- Custom log levels support
- Enhanced logger flexibility

### Changed
- Updated examples
- Improved logger API

## [1.1.2] - 2020-XX-XX

### Added
- Initial release with basic logging functionality
- Logstash configuration support
- Request and response logging
- Express integration

---

## Version History Summary

### Current Versioning (Date-Based)

Starting from **26.1.1**, Motifer uses date-based versioning:
- **Format**: `YY.M.S` (Year.Month.Sequence, npm-compatible - no leading zeros)
- **Example**: `26.1.1` = First release in January 2026
- **Benefits**: Easy to identify when a version was released, clear chronological ordering

### Historical Versions (Semantic Versioning)

Previous versions (before 26.1.1) used semantic versioning:
- **v2.0.0+**: Node.js 20 support and enhanced features
- **v1.3.0+**: Microservice request ID chaining
- **v1.2.0+**: Multiple file appenders and APM support
- **v1.1.x**: Initial releases with basic logging functionality

### Key Milestones

- **26.1.1**: Versioning scheme change to date-based format (npm-compatible)
- **2.0.0**: Node.js 20 support
- **1.3.0**: Microservice request ID chaining
- **1.2.3**: Elastic APM integration
- **1.2.0**: Multiple file appenders
- **1.1.9**: Request ID context fixes
- **1.1.6**: File rotation support

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

---

## Links

- [GitHub Repository](https://github.com/mahajanankur/motifer)
- [NPM Package](https://www.npmjs.com/package/motifer)
- [Documentation](https://github.com/mahajanankur/motifer#readme)

---

**Note**: For exact release dates and detailed commit history, check the [GitHub Releases](https://github.com/mahajanankur/motifer/releases) page and [Git Commit History](https://github.com/mahajanankur/motifer/commits/master).
