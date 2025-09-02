// Build script for creating GitHub releases
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Apple Spotify Player for Release...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run from project root.');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`📦 Building version ${version}`);
console.log('🔧 Target: Windows Portable Executable');
console.log('🎯 No admin rights required\n');

try {
    // Clean previous builds
    if (fs.existsSync('dist')) {
        console.log('🧹 Cleaning previous builds...');
        fs.rmSync('dist', { recursive: true, force: true });
    }

    // Build portable executable
    console.log('⚙️ Building portable executable...');
    execSync('npm run build:portable', { stdio: 'inherit' });

    // Check if build was successful
    const distPath = path.join('dist');
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        const portableFile = files.find(f => f.includes('portable') && f.endsWith('.exe'));
        
        if (portableFile) {
            const filePath = path.join(distPath, portableFile);
            const stats = fs.statSync(filePath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            console.log('\n✅ Build completed successfully!');
            console.log(`📁 File: ${portableFile}`);
            console.log(`📊 Size: ${fileSizeMB} MB`);
            console.log(`📍 Location: ./dist/${portableFile}`);
            console.log('\n🎉 Ready for GitHub Release!');
            
            return { success: true, file: portableFile, size: fileSizeMB };
        }
    }
    
    throw new Error('Portable executable not found in dist folder');
    
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
}