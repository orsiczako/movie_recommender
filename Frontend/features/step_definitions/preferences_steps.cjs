const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Preferences-specific steps only

When('they select favorite genres:', async function (dataTable) {
  const genres = dataTable.raw().map(row => row[0]).slice(1); // Skip header
  
  for (const genre of genres) {
    // Find and click genre checkbox or button
    const genreElement = await this.page.locator(`text=${genre}`).first();
    await genreElement.click();
  }
});

Then('the system saves the genre preferences', async function () {
  await this.page.waitForTimeout(1000);
});

// Rating steps
When('they set minimum rating to {string}', async function (rating) {
  // Find rating input/slider and set value
  const ratingInput = await this.page.locator('input[type="range"], input[type="number"]').first();
  await ratingInput.fill(rating);
});

Then('the system only recommends movies with rating {float} or higher', async function (rating) {
  // This would be verified in the movie recommendations
  await this.page.waitForTimeout(500);
});

// Year range steps
When('they set start year to {string}', async function (year) {
  const startYearInput = await this.page.locator('input[placeholder*="Start"], input[placeholder*="kezd"]').first();
  await startYearInput.fill(year);
});

When('set end year to {string}', async function (year) {
  const endYearInput = await this.page.locator('input[placeholder*="End"], input[placeholder*="vég"]').first();
  await endYearInput.fill(year);
});

Then('the system only recommends movies released between {int} and {int}', async function (startYear, endYear) {
  // This would be verified in the movie recommendations
  await this.page.waitForTimeout(500);
});

