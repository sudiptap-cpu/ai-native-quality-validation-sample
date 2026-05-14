import { test, expect } from "@playwright/test";

test.use({ ignoreHTTPSErrors: true });

test(
  "TC-002: Selecting Brooklyn from search shows Brooklyn listing on page",
  async ({ page }) => {
    await page.goto("https://demo.lambdatestinternal.com/");

    const searchInput = page.locator('input[placeholder="Search destinations"]');
    await expect(searchInput).toBeVisible();

    await searchInput.click();
    await searchInput.fill("Brooklyn");

    // Wait for autocomplete dropdown to render
    await page.waitForTimeout(1500);

    const dropdown = page.locator("div.absolute.top-full");
    await expect(dropdown).toBeVisible();

    // Click the Brooklyn suggestion from the autocomplete dropdown
    const brooklynButton = page
      .locator("div.absolute.top-full button")
      .filter({ hasText: "Brooklyn" })
      .first();
    await brooklynButton.click();

    // Wait for the page to update with listing results
    await page.waitForTimeout(1500);

    // Assert that a Brooklyn, New York listing heading is visible
    const brooklynHeading = page
      .locator("h3")
      .filter({ hasText: "Brooklyn, New York" })
      .first();
    await expect(brooklynHeading).toBeVisible();
  }
);
