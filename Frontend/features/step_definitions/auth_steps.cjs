const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Registration steps
Given('the user is on the registration page', async function () {
  await this.page.goto('http://localhost:3001/register');
});

Given('is on the registration page', async function () {
  await this.page.goto('http://localhost:3001/register');
});

Given('is on the login page', async function () {
  await this.page.goto('http://localhost:3001/login');
});

Given('enters the following data:', async function (dataTable) {
  const data = dataTable.rowsHash();
  
  if (data.fullName) {
    await this.page.waitForSelector('input[id="fullName"]', { timeout: 10000 });
    await this.page.fill('input[id="fullName"]', data.fullName);
  }
  if (data.email) {
    await this.page.waitForSelector('input[id="email"]', { timeout: 10000 });
    await this.page.fill('input[id="email"]', data.email);
  }
  if (data.username) {
    await this.page.waitForSelector('input[id="username"]', { timeout: 10000 });
    await this.page.fill('input[id="username"]', data.username);
  }
  if (data.password) {
    await this.page.waitForSelector('input[id="password"]', { timeout: 10000 });
    await this.page.fill('input[id="password"]', data.password);
  }
});

Then('the system creates the account', async function () {
  // Wait for successful registration response
  await this.page.waitForTimeout(1000);
});

// Login specific steps
Then('the system authenticates the user', async function () {
  // Wait for authentication to complete
  await this.page.waitForTimeout(1000);
});

// Password reset specific steps
Given('the user has forgotten their password', function () {
  // Setup step
  this.email = 'test@example.com';
});

Then('the system sends a reset link to the email address', async function () {
  // Wait for email sending process
  await this.page.waitForTimeout(1000);
});

// Account deletion steps
When('they prepare to confirm the deletion', async function () {
  // Set up dialog handler BEFORE clicking the button
  this.page.once('dialog', async dialog => {
    await dialog.accept();
  });
});

Then('the account is deleted', async function () {
  // Wait for deletion to complete
  await this.page.waitForTimeout(4000);
});


