// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8383',
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: 'npx http-server . -p 8383 -c-1',
    url: 'http://127.0.0.1:8383',
    reuseExistingServer: true,
    timeout: 20000,
  },
});
