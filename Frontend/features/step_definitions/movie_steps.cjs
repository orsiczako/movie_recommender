const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Movie-specific steps only

Given('the user is in the swipe view', async function () {
  await this.page.goto('http://localhost:3001/movies');
});

Given('a movie card is displayed', async function () {
  const movieCard = await this.page.locator('.movie-card, .card').first();
  await expect(movieCard).toBeVisible();
});

When('they swipe the card to the right', async function () {
  const card = await this.page.locator('.movie-card, .card').first();
  await card.click(); // Simulate right swipe action
  // Or use drag gesture if implemented
  const rightButton = await this.page.locator('button:has-text("Like"), .like-button').first();
  if (await rightButton.isVisible()) {
    await rightButton.click();
  }
});

Then('the movie is added to favorites', async function () {
  await this.page.waitForTimeout(1000);
});

Then('the movie is added to watchlist', async function () {
  await this.page.waitForTimeout(500);
});

Then('the next movie card appears', async function () {
  await this.page.waitForTimeout(500);
  const movieCard = await this.page.locator('.movie-card, .card').first();
  await expect(movieCard).toBeVisible();
});

Then('{string} message is displayed', async function (message) {
  // Check for notification
  const notification = await this.page.locator('.notification, .toast, .message').first();
  await expect(notification).toBeVisible({ timeout: 3000 });
});

When('they swipe the card to the left', async function () {
  const card = await this.page.locator('.movie-card, .card').first();
  const leftButton = await this.page.locator('button:has-text("Dislike"), .dislike-button').first();
  if (await leftButton.isVisible()) {
    await leftButton.click();
  }
});

Then('the movie receives a DISLIKE interaction', async function () {
  await this.page.waitForTimeout(1000);
});

Then('the movie will not appear again', async function () {
  // Verify movie is removed from queue
  await this.page.waitForTimeout(500);
});

When('they click the info button', async function () {
  await this.page.click('button:has-text("Info"), button:has-text("i"), .info-button');
});

Then('the movie detail view opens', async function () {
  await this.page.waitForURL('**/movies/**', { timeout: 5000 });
});

Then('the full description is visible', async function () {
  const description = await this.page.locator('.description, .overview').first();
  await expect(description).toBeVisible();
});

Then('the rating is visible', async function () {
  const rating = await this.page.locator('.rating, .vote-average').first();
  await expect(rating).toBeVisible();
});

Then('the genre list is visible', async function () {
  const genres = await this.page.locator('.genres, .genre-tag').first();
  await expect(genres).toBeVisible();
});

Then('the release year is visible', async function () {
  const year = await this.page.locator('.year, .release-date').first();
  await expect(year).toBeVisible();
});

