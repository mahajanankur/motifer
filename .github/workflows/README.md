# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration, security scanning, and automated releases.

## Workflows

### 🔄 [CI](./ci.yml)
**Triggers:** Push and Pull Requests to `master`, `main`, and `develop` branches

**What it does:**
- Runs tests on multiple Node.js versions (16, 18, 20, 22)
- Tests on multiple operating systems (Ubuntu, Windows, macOS)
- Note: Node.js 12.x and 14.x are EOL and excluded from CI (not available on ARM64)
- Verifies package can be built and packed
- Performs basic code quality checks

**Status Badge:**
```markdown
[![CI](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/ci.yml?branch=master&label=CI)](https://github.com/mahajanankur/motifer/actions/workflows/ci.yml)
```

### 🔒 [Security Scan](./security.yml)
**Triggers:** Push, Pull Requests, and Weekly Schedule (Mondays)

**What it does:**
- Runs `npm audit` to check for known vulnerabilities
- Performs dependency review on pull requests
- Scans for security issues in dependencies

**Status Badge:**
```markdown
[![Security Scan](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/security.yml?branch=master&label=Security)](https://github.com/mahajanankur/motifer/actions/workflows/security.yml)
```

### 🚀 [Release](./release.yml)
**Triggers:** GitHub Release creation and Manual dispatch

**What it does:**
- Runs full test suite before publishing
- Verifies package integrity
- Publishes to npm (when release is created)
- Creates GitHub release

**Note:** Requires `NPM_TOKEN` secret to be configured in repository settings.

### 🔍 [CodeQL Analysis](./codeql.yml)
**Triggers:** Push, Pull Requests, and Weekly Schedule (Sundays)

**What it does:**
- Performs static code analysis
- Scans for security vulnerabilities in code
- Uses GitHub's CodeQL engine

**Status Badge:**
```markdown
[![CodeQL](https://img.shields.io/github/actions/workflow/status/mahajanankur/motifer/codeql.yml?branch=master&label=CodeQL)](https://github.com/mahajanankur/motifer/actions/workflows/codeql.yml)
```

### 🏷️ [Stale Issues](./stale.yml)
**Triggers:** Daily Schedule and Manual dispatch

**What it does:**
- Automatically marks stale issues and pull requests
- Closes inactive issues after 60 days
- Closes inactive PRs after 30 days
- Exempts issues/PRs with specific labels (pinned, security, bug, enhancement)

## Setup Instructions

### Required Secrets

For the **Release** workflow to work, you need to set up the following secret in your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add a new secret:
   - **Name:** `NPM_TOKEN`
   - **Value:** Your npm access token (create one at https://www.npmjs.com/settings/YOUR_USERNAME/tokens)

### Optional: Enable CodeQL

CodeQL analysis is automatically enabled. To view results:
1. Go to **Security** tab in your repository
2. Click on **Code scanning alerts**

## Workflow Status

You can view the status of all workflows in the [Actions tab](https://github.com/mahajanankur/motifer/actions) of your repository.

## Customization

### Adding More Node.js Versions

Edit `.github/workflows/ci.yml` and add versions to the `node-version` matrix:

```yaml
node-version: [12.x, 14.x, 16.x, 18.x, 20.x, 22.x]
```

### Changing Test Command

If you add more test scripts, update the workflow:

```yaml
- name: Run tests
  run: npm test

- name: Run coverage
  run: npm run test:coverage
```

### Adding Linting

If you add ESLint or other linters, add a step:

```yaml
- name: Run linter
  run: npm run lint
```

## Troubleshooting

### Tests Failing on Specific Node Versions

1. Check the test output in the Actions tab
2. Verify the Node.js version is supported
3. Check if dependencies are compatible

### Security Scan Failing

1. Review the audit results
2. Update vulnerable dependencies: `npm audit fix`
3. For false positives, you can add exceptions

### Release Workflow Not Publishing

1. Verify `NPM_TOKEN` secret is set correctly
2. Check that the package version in `package.json` is incremented
3. Ensure you have publish permissions on npm

## Contributing

When contributing, make sure:
- ✅ All tests pass (CI workflow will check)
- ✅ No security vulnerabilities (Security workflow will check)
- ✅ Code quality checks pass (Lint workflow will check)

---

For more information, see the [GitHub Actions documentation](https://docs.github.com/en/actions).
