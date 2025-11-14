const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

class CustomWorld {
  constructor({ parameters }) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.parameters = parameters || {};
  }

  async init() {
    const headless = this.parameters.headless || false;
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  await this.init();
});

After(async function () {
  await this.cleanup();
});
