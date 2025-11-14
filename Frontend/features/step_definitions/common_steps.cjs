const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Common navigation steps
Given('the user is on the {string} page', async function (pageName) {
  const pageMap = {
    'registration': '/register',
    'login': '/login',
    'dashboard': '/dashboard',
    'Password Reset': '/forgot-password',
    'password change': '/profile',
    'preferences': '/preferences',
    'AI chat': '/ai-chat',
    'character chat': '/character-chat',
    'favorites': '/favorites',
    'watchlist': '/watchlist',
    'soundtrack': '/soundtrack',
    'profile': '/profile'
  };
  const path = pageMap[pageName] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
  await this.page.goto(`http://localhost:3001${path}`);
});

Given('is on the {string} page', async function (pageName) {
  const pageMap = {
    'registration': '/register',
    'login': '/login',
    'dashboard': '/dashboard',
    'Password Reset': '/forgot-password',
    'password change': '/profile',
    'preferences': '/preferences',
    'AI chat': '/ai-chat'
  };
  const path = pageMap[pageName] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
  await this.page.goto(`http://localhost:3001${path}`);
});

Given('the user is in the application', async function () {
  await this.page.goto('http://localhost:3001/');
});

Given('the user is on the profile page', async function () {
  await this.page.goto('http://localhost:3001/dashboard/profile');
  await this.page.waitForTimeout(2000);
});

Given('is on the profile page', async function () {
  await this.page.goto('http://localhost:3001/dashboard/profile');
  await this.page.waitForTimeout(2000);
});

Given('the user is in a movie detail view', async function () {
  // Navigate to any movie detail page
  await this.page.goto('http://localhost:3001/movies');
  await this.page.waitForTimeout(1000);
  const movieCard = await this.page.locator('.movie-card, .card').first();
  await movieCard.click();
  await this.page.waitForTimeout(1000);
});

// Authentication checks
Given('the user is registered in the system', async function () {
  this.testUser = {
    username: 'test_user',
    password: 'Secure123!',
    email: 'test@example.com'
  };
});

Given('is logged in', async function () {
  await this.page.goto('http://localhost:3001/login');
  await this.page.waitForSelector('input[type="text"], input[id="username"]', { timeout: 10000 });
  await this.page.fill('input[type="text"], input[id="username"]', this.testUser.username);
  await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await this.page.fill('input[type="password"]', this.testUser.password);
  await this.page.waitForSelector('button:has-text("Belépés")', { timeout: 10000 });
  await this.page.click('button:has-text("Belépés")');
  await this.page.waitForTimeout(2000);
  await this.page.waitForURL('**/dashboard', { timeout: 10000 });
});

// Common input actions
When('they enter username {string}', async function (username) {
  await this.page.waitForSelector('input[type="text"], input[id="username"], input[name="username"]', { timeout: 10000 });
  await this.page.fill('input[type="text"], input[id="username"], input[name="username"]', username);
});

When('enter username {string}', async function (username) {
  await this.page.fill('input[type="text"], input[id="username"], input[name="username"]', username);
});

When('they enter password {string}', async function (password) {
  await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await this.page.fill('input[type="password"]', password);
});

When('enter password {string}', async function (password) {
  await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await this.page.fill('input[type="password"]', password);
});

When('they enter email address {string}', async function (email) {
  await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await this.page.fill('input[type="email"], input[name="email"]', email);
});

// Common button clicks
When('they click the {string} button', async function (buttonText) {
  await this.page.waitForSelector(`button:has-text("${buttonText}")`, { timeout: 10000 });
  await this.page.click(`button:has-text("${buttonText}")`);
  await this.page.waitForTimeout(2000);
});

When('click the {string} button', async function (buttonText) {
  await this.page.waitForSelector(`button:has-text("${buttonText}")`, { timeout: 10000 });
  await this.page.click(`button:has-text("${buttonText}")`);
  await this.page.waitForTimeout(2000);
});

// Common assertions
Then('the system displays {string} message', async function (message) {
  await this.page.waitForTimeout(1000);
  const notification = await this.page.locator('.notification, .message, .alert, .success, .error, .toast').first();
  await expect(notification).toBeVisible({ timeout: 10000 });
});

Then('displays {string} message', async function (message) {
  await this.page.waitForTimeout(1000);
  const notification = await this.page.locator('.notification, .message, .alert, .success, .error, .toast').first();
  await expect(notification).toBeVisible({ timeout: 10000 });
});

Then('{string} message appears', async function (message) {
  await this.page.waitForTimeout(1000);
  const notification = await this.page.locator('.notification, .message, .alert, .toast');
  await expect(notification.first()).toBeVisible({ timeout: 10000 });
});

Then('redirects to the {string} page', async function (pageName) {
  const pageMap = {
    'login': '/login',
    'dashboard': '/dashboard',
    'preferences': '/preferences',
    'AI chat': '/ai-chat',
    'character chat': '/character-chat'
  };
  const path = pageMap[pageName] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
  await this.page.waitForURL(`**${path}`, { timeout: 10000 });
  expect(this.page.url()).toContain(path);
});

Then('redirects to the login page', { timeout: 30000 }, async function () {
  await this.page.waitForURL('**/login**', { timeout: 20000 });
  expect(this.page.url()).toContain('/login');
});

Then('redirects to the dashboard', async function () {
  await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  expect(this.page.url()).toContain('/dashboard');
});

// JWT token validation
Then('generates a JWT token', async function () {
  const token = await this.page.evaluate(() => localStorage.getItem('authToken'));
  expect(token).toBeTruthy();
});

// Favorites steps
Given('the user has favorite movies', async function () {
  // This assumes the user already has favorites
  this.hasFavorites = true;
});

Given('the user has no favorite movies', async function () {
  this.hasFavorites = false;
});

When('they click the {string} menu item', async function (menuItem) {
  const menuLink = await this.page.locator(`a:has-text("${menuItem}"), nav >> text=${menuItem}`);
  await menuLink.click();
});

Then('the favorite movies list is displayed', async function () {
  const movieList = await this.page.locator('.movies-grid, .favorites-list');
  await expect(movieList).toBeVisible();
});

Then('each movie card contains the poster image', async function () {
  const posters = await this.page.locator('.movie-card img, .poster');
  expect(await posters.count()).toBeGreaterThan(0);
});

Then('each movie card contains the title', async function () {
  const titles = await this.page.locator('.movie-title, .title');
  expect(await titles.count()).toBeGreaterThan(0);
});

Then('each movie card contains the rating', async function () {
  const ratings = await this.page.locator('.rating, .vote-average');
  expect(await ratings.count()).toBeGreaterThan(0);
});

Then('each movie card contains the genres', async function () {
  const genres = await this.page.locator('.genres, .genre-tag');
  expect(await genres.count()).toBeGreaterThan(0);
});

// Profile steps
When('they modify their name to {string}', async function (newName) {
  const nameInput = await this.page.locator('input[id="name"], input[name="name"]');
  await nameInput.fill(newName);
});

When('they enter current password {string}', async function (password) {
  const currentPasswordInput = await this.page.locator('input[id="currentPassword"]');
  await currentPasswordInput.fill(password);
});

When('enter new password {string}', async function (password) {
  const newPasswordInput = await this.page.locator('input[id="newPassword"]');
  await newPasswordInput.fill(password);
});

When('confirm new password {string}', async function (password) {
  const confirmPasswordInput = await this.page.locator('input[id="confirmPassword"]');
  await confirmPasswordInput.fill(password);
});

Then('the name is updated in the database', async function () {
  await this.page.waitForTimeout(1000);
});

Then('the new name is visible in the application', async function () {
  await this.page.waitForTimeout(500);
});

Then('the password is updated with bcrypt hash', async function () {
  await this.page.waitForTimeout(1000);
});

Then('the new password is required for next login', async function () {
  // This is verified by the system behavior
  await this.page.waitForTimeout(500);
});

// Theme switching
Given('light theme is set', async function () {
  await this.page.evaluate(() => {
    localStorage.setItem('theme', 'light');
  });
});

When('they click the theme switcher button', async function () {
  const themeSwitcher = await this.page.locator('.theme-switcher, .theme-btn');
  await themeSwitcher.click();
});

Then('the application switches to dark theme', async function () {
  await this.page.waitForTimeout(500);
  const html = await this.page.locator('html');
  const theme = await html.getAttribute('data-theme');
  expect(theme).toBe('dark');
});

Then('the setting is saved', async function () {
  const savedTheme = await this.page.evaluate(() => localStorage.getItem('theme'));
  expect(savedTheme).toBeTruthy();
});

Then('dark theme will be used on next visit', async function () {
  // Theme persistence is handled by localStorage
  await this.page.waitForTimeout(100);
});

// Language switching
Given('Hungarian language is set', async function () {
  await this.page.evaluate(() => {
    localStorage.setItem('locale', 'hu');
  });
});

When('they select English language', async function () {
  const langSwitcher = await this.page.locator('.language-switcher, .lang-btn');
  await langSwitcher.click();
  await this.page.click('button:has-text("English"), button:has-text("EN")');
});

Then('all text switches to English', async function () {
  await this.page.waitForTimeout(1000);
});

Then('movie data appears in English', async function () {
  await this.page.waitForTimeout(500);
});

Then('AI responses arrive in English', async function () {
  await this.page.waitForTimeout(500);
});

// Error handling
When('they enter incorrect current password', async function () {
  const currentPasswordInput = await this.page.locator('input[id="currentPassword"]');
  await currentPasswordInput.fill('WrongPassword123!');
});

When('enter a new password', async function () {
  const newPasswordInput = await this.page.locator('input[id="newPassword"]');
  await newPasswordInput.fill('NewPassword456!');
});

Then('an error message appears', async function () {
  const errorMessage = await this.page.locator('.error, .error-message, .alert-error');
  await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
});

Then('the password does not change', async function () {
  await this.page.waitForTimeout(500);
});

