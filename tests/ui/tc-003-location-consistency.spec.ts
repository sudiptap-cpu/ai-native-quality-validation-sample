import { test, expect } from "@playwright/test";

test.use({ ignoreHTTPSErrors: true });

test(
  'TC-003: Popular destinations dropdown shows "United States" consistently with no "USA" abbreviation',
  async ({ page }) => {
    await page.goto("https://demo.lambdatestinternal.com/");

    const searchInput = page.locator('input[placeholder="Search destinations"]');
    await expect(searchInput).toBeVisible();

    // Click the search input to trigger the popular destinations dropdown
    await searchInput.click();

    // Wait for the dropdown to render
    await page.waitForTimeout(1000);

    const dropdown = page.locator("div.absolute.top-full");

    // Assert the dropdown heading "Popular destinations" is visible
    await expect(page.locator("div.absolute.top-full h3")).toBeVisible();
    await expect(page.locator("div.absolute.top-full h3")).toContainText(
      "Popular destinations"
    );

    // Assert Brooklyn's suggestion shows "New York, United States"
    const brooklynButton = page
      .locator("div.absolute.top-full button")
      .filter({ hasText: "Brooklyn" });
    await expect(brooklynButton).toContainText("New York, United States");

    // Assert NO suggestion in the dropdown contains the old "USA" abbreviation
    await expect(dropdown).not.toContainText("USA");

    // Assert "United States" appears at least once in the dropdown (positive check)
    await expect(dropdown).toContainText("United States");
  }
);
