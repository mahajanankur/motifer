# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 26.1.x  | :white_check_mark: |
| < 26.1  | :x:                |

**Note**: Motifer uses date-based versioning (YY.M.S format, npm-compatible). Versions 26.1.x and later are actively supported. Previous versions using semantic versioning (2.0.x, 1.x.x) are no longer supported.

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to protect users.

### 2. Email the maintainer

Send an email to the project maintainer with:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity

### 4. Disclosure Policy

- We will acknowledge receipt of your report
- We will keep you informed of the progress
- We will credit you in the security advisory (if you wish)
- We will not disclose the vulnerability publicly until a fix is available

## Security Best Practices

### For Users

1. **Keep Motifer Updated**: Always use the latest version
2. **Review Dependencies**: Regularly update your dependencies
3. **Secure Log Files**: Ensure log files have proper permissions
4. **Sanitize Log Data**: Don't log sensitive information (passwords, tokens, etc.)
5. **Use HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Store sensitive configuration in environment variables

### For Developers

1. **Input Validation**: Always validate and sanitize inputs
2. **Error Handling**: Don't expose sensitive information in error messages
3. **Dependency Updates**: Keep dependencies up to date
4. **Code Review**: Review code for security issues
5. **Testing**: Write security-focused tests

## Known Security Considerations

### Log File Security

- **File Permissions**: Ensure log files have appropriate permissions
- **Sensitive Data**: Avoid logging passwords, tokens, or PII
- **File Location**: Store logs in secure directories

### Request ID Security

- **UUID v4**: Request IDs use UUID v4 (random), not predictable
- **Header Propagation**: Be cautious when forwarding request IDs across untrusted boundaries

### Dependencies

We regularly audit and update dependencies. Known vulnerabilities in dependencies are addressed promptly.

## Security Updates

Security updates are released using date-based versioning (YY.M.S format):
- **Same month**: Increment sequence number (e.g., 26.1.1 → 26.1.2) for critical fixes
- **New month**: New version with sequence 1 (e.g., 26.1.x → 26.2.1) for security enhancements

## Security Checklist

When contributing code, please ensure:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation and sanitization
- [ ] Proper error handling (no information leakage)
- [ ] Secure file operations
- [ ] Dependencies are up to date
- [ ] No SQL injection risks (if applicable)
- [ ] No XSS vulnerabilities (if applicable)
- [ ] Proper authentication/authorization (if applicable)

## Contact

For security concerns, please contact:
- **GitHub Security Advisory**: Use GitHub's private vulnerability reporting
- **Email**: [Your email here] (for direct contact)

---

**Thank you for helping keep Motifer secure!** 🔒
