#!/bin/bash

# SPOTEYFA v0.3.0 - Cross-Platform Build Trigger Script
# This script helps trigger GitHub Actions builds for all platforms

set -e

VERSION="0.3.0"
TAG="v${VERSION}"
REPO="Avacon00/spoteyfa"

echo "🚀 SPOTEYFA v${VERSION} - Cross-Platform Build Trigger"
echo "======================================================"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is required but not installed."
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

# Check if we're authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Check current workflow status
echo ""
echo "📊 Checking current workflow status..."
gh workflow list --repo $REPO

echo ""
echo "🔍 Recent workflow runs:"
gh run list --repo $REPO --limit 5

# Try to trigger the workflow
echo ""
echo "🚀 Attempting to trigger cross-platform builds..."

# Method 1: Try workflow dispatch
echo "   Method 1: Workflow dispatch..."
if gh workflow run "Build and Release" --repo $REPO --ref $TAG 2>/dev/null; then
    echo "✅ Workflow triggered successfully via dispatch"
else
    echo "⚠️  Workflow dispatch failed (permissions or configuration issue)"
    
    # Method 2: Force push tag to retrigger
    echo "   Method 2: Re-pushing tag to trigger build..."
    
    # Check if we're in the right repository
    if [[ $(git remote get-url origin) == *"$REPO"* ]]; then
        echo "   Detected correct repository"
        
        # Force push the tag to retrigger workflows
        echo "   Re-pushing tag $TAG..."
        git push origin $TAG --force
        echo "✅ Tag re-pushed. This should trigger the build workflow."
    else
        echo "❌ Not in the correct git repository"
        echo "   Expected: $REPO"
        echo "   Current: $(git remote get-url origin 2>/dev/null || echo 'No remote found')"
    fi
fi

echo ""
echo "🔗 Monitor build progress at:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "🎯 Expected outputs after successful builds:"
echo "   📦 Windows: SPOTEYFA-Setup-$VERSION.exe (~145MB)"
echo "   📦 Windows: SPOTEYFA-$VERSION-win-x64-portable.exe (~135MB)"
echo "   📦 macOS: SPOTEYFA-$VERSION-universal.dmg (~120MB)"
echo "   📦 macOS: SPOTEYFA-$VERSION-mac-universal-portable.zip (~115MB)"
echo "   📦 Linux: Already available ✅"
echo ""
echo "⏱️  Estimated build time: 15-20 minutes per platform"
echo "🎵 SPOTEYFA v$VERSION will be fully cross-platform ready soon! ✨"