const { chromium } = require('@playwright/test');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const launchOpts = executablePath ? { executablePath } : {};
  const browser = await chromium.launch({ ...launchOpts, headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('=== TC-002: Clicking Brooklyn suggestion and checking results ===');
    await page.goto('https://demo.lambdatestinternal.com/', { waitUntil: 'networkidle', timeout: 30000 });

    const searchInput = page.locator('input[placeholder="Search destinations"]');
    await searchInput.click();
    await page.waitForTimeout(300);
    await searchInput.pressSequentially('Brooklyn', { delay: 80 });
    await page.waitForTimeout(1500);

    // Find the Brooklyn button in dropdown
    const brooklynButton = page.locator('button:has(p:text-is("Brooklyn"))').first();
    const brooklynButtonCount = await brooklynButton.count();
    console.log('Brooklyn button count:', brooklynButtonCount);

    if (brooklynButtonCount > 0) {
      const buttonText = await brooklynButton.textContent();
      console.log('Brooklyn button text:', buttonText?.trim());

      // Click the Brooklyn suggestion
      await brooklynButton.click();
      await page.waitForTimeout(2000);

      console.log('After clicking Brooklyn, URL:', page.url());
      const pageTitle = await page.title();
      console.log('Page title after click:', pageTitle);

      // Check what's on the results page
      const resultsInfo = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim().substring(0, 100));
        const listingCards = document.querySelectorAll('[class*="card"], [class*="Card"], [class*="listing"], [class*="Listing"]');
        return {
          headings: headings.slice(0, 10),
          listingCount: listingCards.length,
          url: window.location.href
        };
      });
      console.log('Results info:', JSON.stringify(resultsInfo, null, 2));

      // Also look for search button/main search button
      const searchBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button')).filter(b =>
          b.innerHTML.includes('Search') || b.textContent.trim().includes('Search')
        );
        return btns.map(b => ({
          text: b.textContent.trim().substring(0, 50),
          className: b.className.substring(0, 100),
          'data-testid': b.getAttribute('data-testid')
        }));
      });
      console.log('Search buttons:', JSON.stringify(searchBtn, null, 2));
    }

    // TC-003: Check all location suggestions
    console.log('\n=== TC-003: All location suggestions country consistency ===');
    await page.goto('https://demo.lambdatestinternal.com/', { waitUntil: 'networkidle', timeout: 30000 });

    const searchInput3 = page.locator('input[placeholder="Search destinations"]');
    await searchInput3.click();
    await page.waitForTimeout(300);
    // Type a generic term that might show multiple suggestions
    await searchInput3.pressSequentially('a', { delay: 50 });
    await page.waitForTimeout(1500);

    // Capture all suggestion buttons
    const allSuggestions = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && btn.textContent.trim().length > 0;
        })
        .map(btn => ({
          text: btn.textContent.trim().substring(0, 200),
          className: btn.className.substring(0, 100),
          'data-testid': btn.getAttribute('data-testid'),
          hasSubText: btn.querySelectorAll('p').length
        }))
        .filter(b => b.hasSubText > 0 || b.text.includes('United States') || b.text.includes('USA'));
    });
    console.log('Suggestion buttons after typing "a":', JSON.stringify(allSuggestions, null, 2));

    // Also clear and check with empty input
    await searchInput3.clear();
    await page.waitForTimeout(1000);
    const emptySuggestions = await page.evaluate(() => {
      // Look for the dropdown that appears
      const dropdown = document.querySelector('.absolute.top-full, [class*="absolute"]');
      return dropdown ? dropdown.innerHTML.substring(0, 3000) : 'no dropdown found';
    });
    console.log('Empty suggestions dropdown:', emptySuggestions.substring(0, 2000));

    // Try an empty click to see all suggestions
    await searchInput3.click();
    await page.waitForTimeout(1000);
    const emptyClickSuggestions = await page.evaluate(() => {
      const dropdown = document.querySelector('.absolute.top-full');
      if (!dropdown) return 'no dropdown';
      const buttons = Array.from(dropdown.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent.trim().substring(0, 200),
        paragraphs: Array.from(btn.querySelectorAll('p')).map(p => p.textContent.trim())
      }));
    });
    console.log('All suggestions on empty click:', JSON.stringify(emptyClickSuggestions, null, 2));

    // Take a screenshot
    await page.screenshot({ path: '.exploration/empty-suggestions.png' });
    console.log('Screenshot saved');

    // Now check dropdown structure more carefully for all location names
    // Type each common start letter
    for (const term of ['M', 'B', 'A']) {
      await searchInput3.clear();
      await searchInput3.pressSequentially(term, { delay: 50 });
      await page.waitForTimeout(1200);

      const suggestions = await page.evaluate((t) => {
        const dropdown = document.querySelector('.absolute.top-full');
        if (!dropdown) return [];
        const buttons = Array.from(dropdown.querySelectorAll('button'));
        return buttons.map(btn => {
          const ps = Array.from(btn.querySelectorAll('p')).map(p => p.textContent.trim());
          return { city: ps[0], location: ps[1] };
        });
      }, term);
      console.log(`Suggestions for "${term}":`, JSON.stringify(suggestions, null, 2));
    }

  } catch(err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
