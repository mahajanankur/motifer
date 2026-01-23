# Contributing to Motifer

First off, thank you for considering contributing to Motifer! 🎉 It's people like you that make Motifer such an amazing tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Documentation](#documentation)
- [Questions?](#questions)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**
- **Description**: Clear and concise description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: 
  - Node.js version
  - Motifer version
  - Operating System
  - Express version (if applicable)
- **Code Example**: Minimal code example that reproduces the issue
- **Logs**: Relevant log output or error messages
- **Screenshots**: If applicable

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear and descriptive title**
- **Detailed description** of the proposed enhancement
- **Use case**: Why is this enhancement useful?
- **Possible implementation**: If you have ideas on how to implement it
- **Alternatives**: Other solutions you've considered

### 🔧 Pull Requests

Pull requests are the best way to propose changes to Motifer:

1. Fork the repo and create your branch from `master`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the style guidelines
5. Write clear, descriptive commit messages
6. Update the documentation if needed
7. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js >= 12.0.0
- npm >= 6.0.0
- Git

### Getting Started

1. **Fork the repository**

   Click the "Fork" button on the GitHub repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/motifer.git
   cd motifer
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/mahajanankur/motifer.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Run tests**

   ```bash
   npm test
   ```

6. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development Process

### Project Structure

```
motifer/
├── index.js              # Main entry point
├── winstonClient.js      # Winston logger configuration
├── examples/             # Usage examples
├── test/                 # Test files
├── README.md             # Documentation
└── package.json          # Dependencies and scripts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (if available)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Your Changes

1. **Write tests** for new features or bug fixes
2. **Run the test suite** to ensure everything passes
3. **Test manually** with the examples in the `examples/` directory
4. **Test with Express** if your changes affect Express integration

### Example Testing

```bash
# Test with Express example
cd examples
node express-example.js

# Test with basic logger
node basic-example.js
```

## Coding Standards

### JavaScript Style

- Use **ES6+** features where appropriate
- Follow **existing code style** in the project
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **focused and small**

### Code Formatting

- Use **2 spaces** for indentation
- Use **single quotes** for strings (unless escaping)
- Add **trailing commas** in objects and arrays
- Use **semicolons**

### Example

```javascript
// ✅ Good
const LoggerFactory = function (service, level, options) {
  if (!service) {
    throw new Error('Service name is required.');
  }
  // Implementation
};

// ❌ Bad
const LoggerFactory=function(service,level,options){
if(!service){throw new Error("Service name is required.")}
// Implementation
}
```

### Error Handling

- Always **validate inputs**
- Throw **descriptive errors**
- Handle errors **gracefully**

```javascript
// ✅ Good
if (!service) {
  throw new Error('Service name is required.');
}

// ❌ Bad
if (!service) {
  throw new Error('Error');
}
```

### Documentation

- Add **JSDoc comments** for public functions
- Update **README.md** if adding new features
- Include **usage examples** for new features

```javascript
/**
 * @author Your Name
 * @class LoggerFactory
 * @summary Creates a logger factory instance
 * @param {string} service - Service name
 * @param {string} level - Log level
 * @param {Array} options - File appender options
 * @returns {Object} Logger factory
 */
```

## Commit Guidelines

### Commit Message Format

We follow a structured commit message format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(logger): add custom log level support"

# Bug fix
git commit -m "fix(express): fix request ID propagation issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): change LoggerFactory signature

BREAKING CHANGE: LoggerFactory now requires service parameter"
```

### Commit Best Practices

- Write **clear, descriptive** commit messages
- Make **small, focused** commits
- Reference **issues** in commit messages: `fixes #123`
- Use **present tense**: "add feature" not "added feature"

## Pull Request Process

### Before Submitting

1. ✅ **Update tests** - Ensure all tests pass
2. ✅ **Update documentation** - Update README if needed
3. ✅ **Check code style** - Follow coding standards
4. ✅ **Test your changes** - Test with examples
5. ✅ **Rebase on master** - Keep your branch up to date

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings introduced
- [ ] Changes tested manually

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests pass
```

### Review Process

1. **Automated checks** will run (tests, linting)
2. **Maintainers** will review your PR
3. **Feedback** may be requested
4. **Approval** when ready
5. **Merge** by maintainers

## Reporting Bugs

### Before Submitting

1. **Search existing issues** - Your bug might already be reported
2. **Check documentation** - Make sure it's not a usage issue
3. **Test latest version** - Bug might already be fixed

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**
- Node.js version: [e.g. 16.14.0]
- Motifer version: [e.g. 25.01.1]
- OS: [e.g. macOS 12.0]
- Express version: [e.g. 4.18.0] (if applicable)

**Code Example**
```javascript
// Minimal code that reproduces the issue
```

**Additional context**
Add any other context about the problem here.
```

## Suggesting Enhancements

### Enhancement Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of alternative solutions.

**Additional context**
Add any other context, mockups, or examples.
```

## Documentation

### Updating Documentation

- **README.md**: Main documentation file
- **Code comments**: JSDoc for functions
- **Examples**: Update examples in `examples/` directory
- **CHANGELOG.md**: Update for significant changes

### Documentation Style

- Use **clear, concise** language
- Include **code examples**
- Add **screenshots** if helpful
- Keep **formatting consistent**

## Questions?

- 💬 **GitHub Discussions**: For questions and general discussion
- 🐛 **GitHub Issues**: For bug reports and feature requests
- 📧 **Email**: Contact the maintainer directly

## Recognition

Contributors will be:
- Listed in the README (if you'd like)
- Credited in release notes
- Appreciated by the community! 🙏

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to Motifer!** 🎉

Every contribution, no matter how small, makes a difference. We appreciate your time and effort!
