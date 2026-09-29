// End-to-end tests for the web app (the UI inside the Android app), run in Chromium.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Pixel 7'],
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
    },
  },
  webServer: {
    command: 'python3 -m http.server 4173 --directory web',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
