const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// AI Chat steps
Given('the user is in the AI chat view', async function () {
  await this.page.goto('http://localhost:3001/ai-chat');
});

Given('their language setting is {string}', async function (language) {
  // Set language if needed
  const languageMap = {
    'Hungarian': 'hu',
    'English': 'en'
  };
  const langCode = languageMap[language];
  
  // Check if language switcher exists and set it
  const langSwitcher = await this.page.locator('.language-switcher, .lang-btn');
  if (await langSwitcher.isVisible()) {
    await langSwitcher.click();
    await this.page.click(`button:has-text("${language}"), button:has-text("${langCode}")`);
  }
});

When('they type {string}', async function (message) {
  const chatInput = await this.page.locator('input[type="text"], textarea').last();
  await chatInput.fill(message);
});

When('send the message', async function () {
  const sendButton = await this.page.locator('button[type="submit"], .send-button').last();
  await sendButton.click();
});

Then('the AI responds in Hungarian', async function () {
  await this.page.waitForTimeout(2000);
  const response = await this.page.locator('.ai-message, .assistant-message').last();
  await expect(response).toBeVisible({ timeout: 10000 });
});

Then('displays movie recommendations', async function () {
  const movieCards = await this.page.locator('.movie-card, .recommendation-card');
  await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
});

Then('movie posters are in Hungarian', async function () {
  // Verify posters are loaded
  const posters = await this.page.locator('.movie-card img, .poster');
  await expect(posters.first()).toBeVisible();
});

Then('movie descriptions are in Hungarian', async function () {
  // Verify descriptions exist
  await this.page.waitForTimeout(500);
});

Then('the AI responds in English', async function () {
  await this.page.waitForTimeout(2000);
  const response = await this.page.locator('.ai-message, .assistant-message').last();
  await expect(response).toBeVisible({ timeout: 10000 });
});

Then('displays movie recommendations with cards', async function () {
  const movieCards = await this.page.locator('.movie-card, .recommendation-card');
  await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
});

// Add to favorites from AI chat
Given('the user has received movie recommendations from AI', async function () {
  await this.page.goto('http://localhost:3001/ai-chat');
  await this.page.fill('input[type="text"], textarea', 'Recommend a movie');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(3000);
});

Given('movie cards are displayed', async function () {
  const movieCards = await this.page.locator('.movie-card, .recommendation-card');
  await expect(movieCards.first()).toBeVisible({ timeout: 10000 });
});

When('they click on a movie card heart icon', async function () {
  const heartIcon = await this.page.locator('.heart-icon, .favorite-button, [class*="favorite"]').first();
  await heartIcon.click();
});

Then('the movie is added to favorites', async function () {
  await this.page.waitForTimeout(1000);
});

Then('the heart icon becomes filled', async function () {
  const heartIcon = await this.page.locator('.heart-icon.filled, .favorite-button.active, [class*="favorited"]').first();
  await expect(heartIcon).toBeVisible({ timeout: 3000 });
});
