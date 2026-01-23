# GitHub Actions Setup Guide

## ✅ What's Been Added

I've created comprehensive GitHub Actions workflows for your Motifer project:

### 1. **CI Workflow** (`ci.yml`)
- ✅ Runs tests on **Node.js versions** (16, 18, 20, 22)
- ✅ Tests on **3 operating systems** (Ubuntu, Windows, macOS)
- ✅ Note: Node.js 12.x and 14.x are EOL and not available on ARM64, so they're excluded from CI
- ✅ Verifies package can be built and packed
- ✅ Basic code quality checks
- ✅ **Status badge** added to README

### 2. **Security Scan** (`security.yml`)
- ✅ Weekly automated security audits
- ✅ Dependency vulnerability scanning
- ✅ Pull request dependency review
- ✅ **Status badge** added to README

### 3. **Release Workflow** (`release.yml`)
- ✅ Automated npm publishing on releases
- ✅ Pre-publish test verification
- ✅ Package integrity checks
- ⚠️ **Requires NPM_TOKEN secret** (see setup below)

### 4. **CodeQL Analysis** (`codeql.yml`)
- ✅ Static code analysis
- ✅ Security vulnerability detection
- ✅ Weekly automated scans
- ✅ **Status badge** added to README

### 5. **Stale Issues** (`stale.yml`)
- ✅ Automatically manages inactive issues/PRs
- ✅ Daily cleanup of stale items
- ✅ Configurable thresholds

## 🚀 Quick Start

### 1. Push to GitHub
The workflows will automatically run when you push to GitHub!

```bash
git add .github/workflows/
git commit -m "Add GitHub Actions workflows for CI/CD"
git push origin master
```

### 2. View Results
- Go to the **Actions** tab in your GitHub repository
- You'll see all workflows running
- Green checkmarks = passing ✅
- Red X = failing ❌

### 3. Set Up NPM Publishing (Optional)
If you want automated npm publishing:

1. Create an npm access token:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select "Automation" type
   - Copy the token

2. Add it to GitHub:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click **Add secret**

3. Create a release:
   - Go to **Releases** → **Create a new release**
   - Tag: `v25.01.2` (or your version in YY.MM.S format)
   - The workflow will automatically publish to npm!

## 📊 What You'll See

### In Your Repository

1. **Actions Tab**: Shows all workflow runs with status
2. **README Badges**: Shows build status at the top
3. **Pull Requests**: Shows CI status checks
4. **Security Tab**: Shows CodeQL and dependency scan results

### Status Badges

The badges in your README will show:
- ✅ **Green**: All checks passing
- ❌ **Red**: Some checks failing
- 🟡 **Yellow**: In progress

## 🎯 Recommended Next Steps

### 1. Add Test Coverage (Optional)

If you want to add test coverage reporting:

```bash
npm install --save-dev nyc
```

Update `package.json`:
```json
{
  "scripts": {
    "test": "mocha ./test/*.spec.js",
    "test:coverage": "nyc npm test"
  }
}
```

Then update `ci.yml` to include:
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### 2. Add ESLint (Optional)

For code quality:

```bash
npm install --save-dev eslint
```

Create `.eslintrc.js`:
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  rules: {
    // Your rules here
  }
};
```

Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 3. Add Prettier (Optional)

For code formatting:

```bash
npm install --save-dev prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}
```

## 🔧 Customization

### Change Node.js Versions

Edit `.github/workflows/ci.yml`:
```yaml
# Current: [16, 18, 20, 22]
# Note: Node.js 12.x and 14.x are EOL and not available on ARM64
node-version: [18, 20, 22]  # Example: only test on LTS versions
```

### Change Test Command

If you add more test scripts:
```yaml
- name: Run tests
  run: npm test

- name: Run integration tests
  run: npm run test:integration
```

### Adjust Stale Issue Settings

Edit `.github/workflows/stale.yml`:
```yaml
days-before-issue-stale: 90  # Change from 60 to 90
days-before-pr-stale: 45     # Change from 30 to 45
```

## 📈 Benefits

### For Contributors
- ✅ Know immediately if their PR breaks tests
- ✅ See security issues before merging
- ✅ Get feedback on code quality

### For Maintainers
- ✅ Automated testing on multiple environments
- ✅ Security scanning prevents vulnerabilities
- ✅ Automated releases save time
- ✅ Professional appearance with badges

### For Users
- ✅ Confidence in package quality
- ✅ Visible test status
- ✅ Security assurance

## 🐛 Troubleshooting

### Workflows Not Running
- Check that workflows are in `.github/workflows/` directory
- Verify YAML syntax is correct
- Check repository settings → Actions → Allow actions

### Tests Failing
- Check the Actions tab for error details
- Run tests locally: `npm test`
- Verify Node.js version compatibility

### Security Scan Failing
- Review `npm audit` output
- Update vulnerable packages: `npm audit fix`
- Check if false positives need exceptions

### Release Not Publishing
- Verify `NPM_TOKEN` secret is set
- Check npm permissions
- Ensure version in `package.json` is incremented

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [CodeQL Documentation](https://codeql.github.com/docs/)

## 🎉 You're All Set!

Your repository now has professional CI/CD workflows that will:
- ✅ Run tests automatically
- ✅ Check for security issues
- ✅ Verify builds
- ✅ Show status badges
- ✅ Automate releases

Just push your code and watch the magic happen! 🚀

---

**Questions?** Open an issue or check the [workflows README](./workflows/README.md) for more details.
