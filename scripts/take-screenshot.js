const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a timestamp for the screenshot
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

(async () => {
  console.log('Starting Next.js app...');
  
  // Start the Next.js app in a separate process
  const nextProcess = require('child_process').spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', 'ash-portfolio'),
    stdio: 'inherit',
    shell: true
  });
  
  // Wait for the app to start
  console.log('Waiting for app to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to 1280x720
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('Navigating to app...');
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for any animations or content to load
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(imagesDir, `screenshot_${timestamp}.png`);
    console.log(`Taking screenshot and saving to ${screenshotPath}...`);
    
    // Take screenshot
    await page.screenshot({ 
      path: screenshotPath,
      clip: {
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      }
    });
    
    await browser.close();
    console.log('Screenshot taken successfully!');
    
    // Generate GIF if there are multiple screenshots
    const screenshots = fs.readdirSync(imagesDir)
      .filter(file => file.endsWith('.png'))
      .map(file => path.join(imagesDir, file))
      .sort();
    
    if (screenshots.length > 1) {
      console.log('Generating GIF from screenshots...');
      try {
        // Check if gifski is installed
        execSync('gifski --version', { stdio: 'ignore' });
        
        // Generate GIF using gifski
        const gifPath = path.join(imagesDir, 'pathfinder-progress.gif');
        execSync(`gifski --fps 2 --width 500 --height 500 --quality 80 -o "${gifPath}" ${screenshots.join(' ')}`, {
          stdio: 'inherit'
        });
        
        console.log(`GIF generated successfully at ${gifPath}!`);
        
        // Update README with the GIF
        const readmePath = path.join(__dirname, '..', 'README.md');
        let readmeContent = '';
        
        if (fs.existsSync(readmePath)) {
          readmeContent = fs.readFileSync(readmePath, 'utf8');
          
          // Check if README already has a GIF section
          if (readmeContent.includes('## Pathfinder Progress')) {
            // Replace the existing GIF section
            readmeContent = readmeContent.replace(
              /## Pathfinder Progress[\s\S]*?!\[Pathfinder Progress\]\([^)]+\)/,
              '## Pathfinder Progress\n\n![Pathfinder Progress](images/pathfinder-progress.gif)'
            );
          } else {
            // Add GIF section at the end
            readmeContent += '\n\n## Pathfinder Progress\n\n![Pathfinder Progress](images/pathfinder-progress.gif)';
          }
        } else {
          // Create a new README with the GIF
          readmeContent = '# Pathfinding Visualizer\n\n## Pathfinder Progress\n\n![Pathfinder Progress](images/pathfinder-progress.gif)';
        }
        
        fs.writeFileSync(readmePath, readmeContent);
        console.log('README updated with latest GIF!');
      } catch (error) {
        console.error('Error generating GIF:', error.message);
        console.log('Please install gifski to generate GIFs: https://gif.ski/');
      }
    } else {
      console.log('Need at least 2 screenshots to generate a GIF.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Kill the Next.js process
    console.log('Stopping Next.js app...');
    nextProcess.kill();
  }
})();