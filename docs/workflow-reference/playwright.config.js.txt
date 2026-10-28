const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/playwright',
  timeout: 45000,
  workers: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', {outputFolder:'artifacts/playwright-html-report',open:'never'}]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName:'chromium',
    screenshot:'only-on-failure',
    trace:'retain-on-failure',
    launchOptions: process.env.PORTFOLIO_BROWSER_EXECUTABLE ? {
      executablePath:process.env.PORTFOLIO_BROWSER_EXECUTABLE,
      args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
    } : {}
  },
  projects: [
    {name:'mobile',use:{viewport:{width:360,height:900}}},
    {name:'tablet',use:{viewport:{width:768,height:1024}}},
    {name:'laptop',use:{viewport:{width:1024,height:900}}},
    {name:'desktop',use:{viewport:{width:1440,height:1000}}}
  ],
  webServer: {
    command:'node scripts/testing/serve-static-site.js',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:false,
    timeout:30000
  }
});
