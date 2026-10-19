const {defineConfig} = require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests/production',
  timeout:60000,
  retries:2,
  workers:1,
  reporter:[['list'],['html',{outputFolder:'artifacts/production-validation',open:'never'}]],
  use:{
    baseURL:process.env.PORTFOLIO_PRODUCTION_URL || 'https://jeremyfontenot.online',
    browserName:'chromium',
    ignoreHTTPSErrors:false,
    screenshot:'on',
    trace:'retain-on-failure',
    navigationTimeout:45000,
    actionTimeout:20000
  },
  projects:[
    {name:'mobile',use:{viewport:{width:360,height:800},deviceScaleFactor:1}},
    {name:'tablet',use:{viewport:{width:768,height:1024},deviceScaleFactor:1}},
    {name:'laptop',use:{viewport:{width:1024,height:900},deviceScaleFactor:1}},
    {name:'desktop',use:{viewport:{width:1440,height:900},deviceScaleFactor:1}}
  ]
});
