#!/bin/bash
# NPM Publish Helper Script for Motifer
# This script helps you publish after setting up authentication

set -e

echo "🚀 Motifer NPM Publish Helper"
echo "=============================="
echo ""

# Check if logged in
if ! npm whoami &>/dev/null; then
    echo "❌ Not logged in to npm"
    echo ""
    echo "Please run: npm login --auth-type=legacy"
    exit 1
fi

USERNAME=$(npm whoami)
echo "✅ Logged in as: $USERNAME"
echo ""

# Check 2FA status
echo "Checking 2FA status..."
TWO_FA_STATUS=$(npm profile get 2>/dev/null | grep "two-factor auth" | awk '{print $4}')

if [ "$TWO_FA_STATUS" = "disabled" ]; then
    echo "⚠️  Two-factor authentication is DISABLED"
    echo ""
    echo "You need to either:"
    echo "1. Enable 2FA: https://www.npmjs.com/settings/$USERNAME/security"
    echo "2. Create a granular access token: https://www.npmjs.com/settings/$USERNAME/tokens"
    echo ""
    echo "For token setup:"
    echo "  - Token type: Granular Access Token"
    echo "  - Package: motifer"
    echo "  - Permission: Publish"
    echo "  - Enable: Bypass 2FA"
    echo ""
    read -p "Have you set up 2FA or created a token? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please set up authentication first, then run this script again."
        exit 1
    fi
    
    # If they have a token, help them login
    echo ""
    echo "If you created a token, let's update your login:"
    echo "Run: npm logout && npm login --auth-type=legacy"
    echo "When prompted for password, paste your token (not your npm password)"
    exit 0
else
    echo "✅ Two-factor authentication is ENABLED"
fi

echo ""
echo "📦 Package Information:"
npm pack --dry-run 2>&1 | grep -E "(name|version|package size)" | head -3

echo ""
read -p "Ready to publish motifer@26.1.1 to npm? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Publish cancelled."
    exit 0
fi

echo ""
echo "Publishing..."
npm publish

echo ""
echo "✅ Published successfully!"
echo "View at: https://www.npmjs.com/package/motifer"
