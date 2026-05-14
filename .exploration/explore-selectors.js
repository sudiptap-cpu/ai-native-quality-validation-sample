const { chromium } = require('@playwright/test');

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const launchOpts = executablePath ? { executablePath } : {};
  const browser = await chromium.launch({ ...launchOpts, headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    console.log('Navigating to homepage...');
    await page.goto('https://demo.lambdatestinternal.com/', { waitUntil: 'networkidle', timeout: 30000 });

    // Capture page title
    const title = await page.title();
    console.log('Page title:', title);

    // Capture all input elements
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(el => ({
        type: el.type,
        placeholder: el.placeholder,
        id: el.id,
        name: el.name,
        className: el.className,
        'data-testid': el.getAttribute('data-testid'),
        'aria-label': el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        value: el.value
      }));
    });
    console.log('Inputs:', JSON.stringify(inputs, null, 2));

    // Look for search-related elements
    const searchElements = await page.evaluate(() => {
      const selectors = [
        '[data-testid*="search"]',
        '[data-testid*="location"]',
        '[placeholder*="location"]',
        '[placeholder*="search"]',
        '[placeholder*="where"]',
        '[placeholder*="Where"]',
        'input[type="text"]',
        'input[type="search"]',
        '[role="combobox"]',
        '[role="searchbox"]'
      ];

      const results = {};
      selectors.forEach(sel => {
        try {
          const els = Array.from(document.querySelectorAll(sel));
          if (els.length > 0) {
            results[sel] = els.map(el => ({
              tagName: el.tagName,
              id: el.id,
              className: el.className.substring(0, 100),
              'data-testid': el.getAttribute('data-testid'),
              'aria-label': el.getAttribute('aria-label'),
              placeholder: el.getAttribute('placeholder'),
              text: el.textContent ? el.textContent.trim().substring(0, 100) : ''
            }));
          }
        } catch(e) {}
      });
      return results;
    });
    console.log('Search elements:', JSON.stringify(searchElements, null, 2));

    // Get header/nav HTML snippets
    const containerHtml = await page.evaluate(() => {
      const containers = {
        'header': document.querySelector('header'),
        'nav': document.querySelector('nav'),
        'form': document.querySelector('form'),
        '[class*=Search]': document.querySelector('[class*="Search"]'),
        '[class*=search]': document.querySelector('[class*="search"]'),
      };
      const results = {};
      Object.entries(containers).forEach(([key, el]) => {
        if (el) results[key] = el.outerHTML.substring(0, 800);
      });
      return results;
    });
    console.log('Container HTML:', JSON.stringify(containerHtml, null, 2));

    // Try to type 'Brooklyn' in the first text input
    const textInputs = page.locator('input[type="text"], input[placeholder]');
    const count = await textInputs.count();
    console.log('Text input count:', count);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = textInputs.nth(i);
      const ph = await input.getAttribute('placeholder');
      const dt = await input.getAttribute('data-testid');
      console.log(`Input ${i}: placeholder="${ph}", data-testid="${dt}"`);
    }

    // Try to click and type into first input
    if (count > 0) {
      await textInputs.first().click();
      await page.waitForTimeout(500);
      await textInputs.first().fill('Brooklyn');
      await page.waitForTimeout(2000);

      // Capture dropdown/autocomplete
      const dropdown = await page.evaluate(() => {
        const selectors = [
          '[role="listbox"]',
          '[role="option"]',
          '[class*="dropdown"]',
          '[class*="Dropdown"]',
          '[class*="suggestion"]',
          '[class*="Suggestion"]',
          '[class*="autocomplete"]',
          '[class*="Autocomplete"]',
          '[class*="option"]',
          '[class*="Option"]',
          'ul li'
        ];
        const results = {};
        selectors.forEach(sel => {
          try {
            const els = Array.from(document.querySelectorAll(sel));
            if (els.length > 0 && els.length < 30) {
              results[sel] = els.map(el => ({
                text: el.textContent.trim().substring(0, 200),
                'data-testid': el.getAttribute('data-testid'),
                className: el.className.substring(0, 100),
                visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
              }));
            }
          } catch(e) {}
        });
        return results;
      });
      console.log('Dropdown after typing Brooklyn:', JSON.stringify(dropdown, null, 2));

      // Screenshot
      await page.screenshot({ path: '.exploration/after-brooklyn.png' });
      console.log('Screenshot saved');
    }

  } catch(err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
