const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ defaultViewport: { width: 1920, height: 1080 }, headless: true,
    args: [
        '--no-sandbox', // Required in some CI environments
        '--disable-setuid-sandbox',
      ]});
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const fileName = `screenshot_${Date.now().toString()}.png`;
  await page.screenshot({ path: fileName });
  await browser.close();
})();