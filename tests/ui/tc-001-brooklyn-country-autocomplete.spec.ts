import { test, expect } from "@playwright/test";

test.use({ ignoreHTTPSErrors: true });

test('TC-001: Brooklyn search autocomplete shows "United States" not "USA"', async ({
  page,
}) => {
  await page.goto("https://demo.lambdatestinternal.com/");

  const searchInput = page.locator('input[placeholder="Search destinations"]');
  await expect(searchInput).toBeVisible();

  await searchInput.click();
  await searchInput.fill("Brooklyn");

  // Wait for autocomplete to render
  await page.waitForTimeout(1500);

  const dropdown = page.locator("div.absolute.top-full");
  await expect(dropdown).toBeVisible();

  // Assert "New York, United States" is visible in the dropdown
  await expect(
    dropdown.getByText("New York, United States")
  ).toBeVisible();

  // Assert "USA" does NOT appear anywhere in the dropdown
  await expect(dropdown).not.toContainText("USA");
});
