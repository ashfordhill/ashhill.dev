const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('Installing gifski for GIF generation...');

try {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // For Windows, download the binary from GitHub
    console.log('Detected Windows platform');
    
    // Create a temp directory for the download
    const tempDir = path.join(os.tmpdir(), 'gifski-download');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Download the latest release
    const zipPath = path.join(tempDir, 'gifski.zip');
    console.log('Downloading gifski...');
    execSync(`curl -L -o "${zipPath}" https://github.com/ImageOptim/gifski/releases/download/1.11.0/gifski-1.11.0.zip`, {
      stdio: 'inherit'
    });
    
    // Extract the zip file
    console.log('Extracting...');
    const extractDir = path.join(tempDir, 'extract');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    // Use PowerShell to extract the zip
    execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`, {
      stdio: 'inherit'
    });
    
    // Create a bin directory in the project
    const binDir = path.join(__dirname, '..', 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    // Copy the executable to the bin directory
    console.log('Installing gifski to project bin directory...');
    fs.copyFileSync(
      path.join(extractDir, 'gifski.exe'),
      path.join(binDir, 'gifski.exe')
    );
    
    console.log('gifski installed successfully!');
    console.log(`You can now use it with: ${path.join(binDir, 'gifski.exe')}`);
    
    // Add instructions to add to PATH
    console.log('\nTo use gifski from anywhere, add the following directory to your PATH:');
    console.log(binDir);
    
  } else if (platform === 'darwin') {
    // For macOS, use Homebrew
    console.log('Detected macOS platform');
    console.log('Installing gifski using Homebrew...');
    
    try {
      // Check if Homebrew is installed
      execSync('brew --version', { stdio: 'ignore' });
      
      // Install gifski
      execSync('brew install gifski', { stdio: 'inherit' });
      console.log('gifski installed successfully!');
      
    } catch (error) {
      console.error('Error: Homebrew is not installed. Please install Homebrew first:');
      console.error('https://brew.sh/');
    }
    
  } else if (platform === 'linux') {
    // For Linux, use cargo
    console.log('Detected Linux platform');
    console.log('Installing gifski using cargo...');
    
    try {
      // Check if cargo is installed
      execSync('cargo --version', { stdio: 'ignore' });
      
      // Install gifski
      execSync('cargo install gifski', { stdio: 'inherit' });
      console.log('gifski installed successfully!');
      
    } catch (error) {
      console.error('Error: Rust/Cargo is not installed. Please install Rust first:');
      console.error('https://www.rust-lang.org/tools/install');
    }
  } else {
    console.error(`Unsupported platform: ${platform}`);
    console.error('Please install gifski manually: https://gif.ski/');
  }
} catch (error) {
  console.error('Error installing gifski:', error.message);
  console.error('Please install gifski manually: https://gif.ski/');
}