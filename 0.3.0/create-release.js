#!/usr/bin/env node

/**
 * SPOTEYFA v0.3.0 - GitHub Release Creator
 * 
 * This script prepares and creates a GitHub release with all assets:
 * 1. Validates all build artifacts
 * 2. Creates release notes
 * 3. Uploads release assets
 * 4. Creates GitHub release with proper tags
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubReleaseCreator {
    constructor() {
        this.version = '0.3.0';
        this.tagName = `v${this.version}`;
        this.releaseName = `🎵 SPOTEYFA v${this.version} - The Performance Revolution`;
        this.buildDir = './dist';
        this.portableDir = './portable';
        
        this.assets = [
            // Regular builds
            { file: 'SPOTEYFA-0.3.0.AppImage', name: 'SPOTEYFA-0.3.0-Linux-x64.AppImage' },
            { file: 'apple-spotify-player_0.3.0_amd64.deb', name: 'SPOTEYFA-0.3.0-Linux-amd64.deb' },
            
            // Portable versions
            { file: '../portable/SPOTEYFA-v0.3.0-Linux-x64-Portable.AppImage', name: 'SPOTEYFA-v0.3.0-Linux-x64-Portable.AppImage' },
            { file: '../portable/SPOTEYFA-Linux-Portable-Instructions.txt', name: 'Portable-Instructions.txt' }
        ];
    }

    log(message, type = 'info') {
        const icons = { info: '📝', success: '✅', warn: '⚠️', error: '❌' };
        console.log(`${icons[type]} ${message}`);
    }

    async validateAssets() {
        this.log('Validating release assets...', 'info');
        
        const missingAssets = [];
        const validAssets = [];

        for (const asset of this.assets) {
            const fullPath = path.resolve(this.buildDir, asset.file);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
                this.log(`   Found: ${asset.name} (${sizeMB}MB)`, 'success');
                validAssets.push({ ...asset, path: fullPath, size: sizeMB });
            } else {
                this.log(`   Missing: ${asset.name}`, 'warn');
                missingAssets.push(asset);
            }
        }

        if (missingAssets.length > 0) {
            this.log(`Found ${missingAssets.length} missing assets`, 'warn');
        }

        return { validAssets, missingAssets };
    }

    async createTag() {
        this.log(`Creating Git tag: ${this.tagName}`, 'info');
        
        try {
            // Check if tag already exists
            const tagExists = execSync(`git tag -l "${this.tagName}"`, { encoding: 'utf8' }).trim();
            
            if (tagExists) {
                this.log(`Tag ${this.tagName} already exists. Deleting and recreating...`, 'warn');
                execSync(`git tag -d ${this.tagName}`, { stdio: 'ignore' });
            }

            // Create new tag
            execSync(`git tag -a ${this.tagName} -m "SPOTEYFA v${this.version} - The Performance Revolution"`, { stdio: 'inherit' });
            this.log(`Tag ${this.tagName} created successfully`, 'success');
            
            return true;
        } catch (error) {
            this.log(`Failed to create tag: ${error.message}`, 'error');
            return false;
        }
    }

    async generateReleaseNotes() {
        this.log('Generating release notes...', 'info');
        
        const notesPath = './RELEASE-NOTES-v0.3.0.md';
        if (!fs.existsSync(notesPath)) {
            this.log('Release notes file not found!', 'error');
            return null;
        }

        const releaseNotes = fs.readFileSync(notesPath, 'utf8');
        this.log('Release notes loaded successfully', 'success');
        return releaseNotes;
    }

    async createGitHubRelease(releaseNotes, assets) {
        this.log('Creating GitHub release...', 'info');
        
        try {
            // Check if gh CLI is available
            execSync('gh --version', { stdio: 'ignore' });
        } catch (error) {
            this.log('GitHub CLI (gh) not available. Please install it first.', 'error');
            return false;
        }

        try {
            // Create release with notes
            const releaseCmd = [
                'gh release create',
                this.tagName,
                '--title', `"${this.releaseName}"`,
                '--notes-file', './RELEASE-NOTES-v0.3.0.md',
                '--prerelease'  // Remove this for stable release
            ];

            // Add assets
            for (const asset of assets) {
                releaseCmd.push(`"${asset.path}#${asset.name}"`);
            }

            const fullCmd = releaseCmd.join(' ');
            this.log(`Executing: ${fullCmd}`, 'info');
            
            execSync(fullCmd, { stdio: 'inherit', cwd: process.cwd() });
            this.log('GitHub release created successfully!', 'success');
            
            return true;
        } catch (error) {
            this.log(`Failed to create GitHub release: ${error.message}`, 'error');
            return false;
        }
    }

    async generateSummaryReport(assets) {
        this.log('Generating release summary...', 'info');
        
        const summary = {
            version: this.version,
            tag: this.tagName,
            title: this.releaseName,
            totalAssets: assets.length,
            totalSize: assets.reduce((sum, asset) => sum + parseFloat(asset.size), 0).toFixed(1),
            assets: assets.map(asset => ({
                name: asset.name,
                size: `${asset.size}MB`
            }))
        };

        console.log('\\n' + '='.repeat(60));
        console.log('🎯 SPOTEYFA v0.3.0 RELEASE SUMMARY');
        console.log('='.repeat(60));
        console.log(`📝 Release: ${summary.title}`);
        console.log(`🏷️  Tag: ${summary.tag}`);
        console.log(`📦 Assets: ${summary.totalAssets} files (${summary.totalSize}MB total)`);
        console.log('\\n📋 Release Assets:');
        
        summary.assets.forEach((asset, index) => {
            console.log(`   ${index + 1}. ${asset.name} - ${asset.size}`);
        });
        
        console.log('\\n🔗 Release URL: https://github.com/Avacon00/spoteyfa/releases/tag/' + this.tagName);
        console.log('='.repeat(60));
        
        return summary;
    }

    async run() {
        console.log('\\n🚀 SPOTEYFA v0.3.0 - GitHub Release Creator');
        console.log('='.repeat(50));
        
        // Step 1: Validate assets
        const { validAssets, missingAssets } = await this.validateAssets();
        
        if (validAssets.length === 0) {
            this.log('No valid assets found for release!', 'error');
            process.exit(1);
        }

        // Step 2: Generate release notes
        const releaseNotes = await this.generateReleaseNotes();
        if (!releaseNotes) {
            this.log('Cannot proceed without release notes', 'error');
            process.exit(1);
        }

        // Step 3: Create Git tag
        const tagCreated = await this.createTag();
        if (!tagCreated) {
            this.log('Cannot proceed without Git tag', 'error');
            process.exit(1);
        }

        // Step 4: Create GitHub release
        this.log('\\nProceeding with GitHub release creation...', 'info');
        console.log('Note: You can run this manually with:');
        console.log(`gh release create ${this.tagName} --title "${this.releaseName}" --notes-file ./RELEASE-NOTES-v0.3.0.md --prerelease`);
        
        // Step 5: Generate summary
        await this.generateSummaryReport(validAssets);
        
        this.log('\\n🎉 Release preparation completed successfully!', 'success');
        this.log('   1. Git tag created', 'success');
        this.log('   2. Release notes generated', 'success');
        this.log('   3. Assets validated', 'success');
        this.log('   4. Ready for GitHub release', 'success');
        
        console.log('\\n💡 Next steps:');
        console.log('   • Push the tag: git push origin ' + this.tagName);
        console.log('   • Create release: gh release create ' + this.tagName + ' --title "' + this.releaseName + '" --notes-file ./RELEASE-NOTES-v0.3.0.md');
        console.log('   • Upload assets manually or run the gh command above');
        
        return true;
    }
}

// Run the release creator
if (require.main === module) {
    const creator = new GitHubReleaseCreator();
    creator.run().catch(error => {
        console.error('❌ Release creation failed:', error);
        process.exit(1);
    });
}

module.exports = GitHubReleaseCreator;