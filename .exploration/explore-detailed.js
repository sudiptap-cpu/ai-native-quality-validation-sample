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
    console.log('Page loaded, title:', await page.title());

    // Click on the search input
    const searchInput = page.locator('input[placeholder="Search destinations"]');
    await searchInput.click();
    console.log('Clicked search input');
    await page.waitForTimeout(500);

    // Type character by character to trigger React state updates
    await searchInput.pressSequentially('Brooklyn', { delay: 100 });
    console.log('Typed Brooklyn');
    await page.waitForTimeout(2000);

    // Capture full page HTML to understand what appeared
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    console.log('Body HTML length:', bodyHtml.length);

    // Find anything with "Brooklyn" in it
    const brooklynElements = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.children.length === 0 && el.textContent.includes('Brooklyn') && el.textContent.trim().length < 300) {
          results.push({
            tag: el.tagName,
            text: el.textContent.trim(),
            id: el.id,
            className: el.className.substring(0, 100),
            'data-testid': el.getAttribute('data-testid'),
            selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : '')
          });
        }
      });
      return results.slice(0, 20);
    });
    console.log('Elements with Brooklyn text:', JSON.stringify(brooklynElements, null, 2));

    // Check if any dropdown/list appeared
    const visibleElements = await page.evaluate(() => {
      const candidates = [
        '[role="listbox"]',
        '[role="option"]',
        '[role="list"]',
        '[role="listitem"]',
        'ul',
        'li',
        '[class*="suggestion"]',
        '[class*="dropdown"]',
        '[class*="autocomplete"]',
        '[class*="results"]',
        '[class*="location"]'
      ];
      const results = {};
      candidates.forEach(sel => {
        const els = Array.from(document.querySelectorAll(sel));
        const visible = els.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        if (visible.length > 0 && visible.length < 30) {
          results[sel] = visible.map(el => ({
            text: el.textContent.trim().substring(0, 200),
            className: el.className.substring(0, 80),
            'data-testid': el.getAttribute('data-testid')
          }));
        }
      });
      return results;
    });
    console.log('Visible elements after typing:', JSON.stringify(visibleElements, null, 2));

    // Screenshot of current state
    await page.screenshot({ path: '.exploration/brooklyn-typed.png', fullPage: false });
    console.log('Screenshot saved to .exploration/brooklyn-typed.png');

    // Get the specific dropdown container if it exists
    const dropdownHtml = await page.evaluate(() => {
      // Look for the suggestion container
      const possibleContainers = [
        document.querySelector('[class*="suggestion"]'),
        document.querySelector('[class*="dropdown"]'),
        document.querySelector('[class*="Suggestion"]'),
        document.querySelector('[class*="Dropdown"]'),
        document.querySelector('[role="listbox"]'),
      ];
      for (const container of possibleContainers) {
        if (container && container.innerHTML.trim()) {
          return { selector: container.className, html: container.innerHTML.substring(0, 2000) };
        }
      }
      return null;
    });
    console.log('Dropdown container:', JSON.stringify(dropdownHtml, null, 2));

    // Check the search bar container parent structure
    const searchContainerStructure = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search destinations"]');
      if (!input) return 'input not found';
      let el = input;
      let path = [];
      for (let i = 0; i < 8; i++) {
        if (!el) break;
        path.push({
          tag: el.tagName,
          class: el.className ? el.className.substring(0, 80) : '',
          id: el.id,
          'data-testid': el.getAttribute ? el.getAttribute('data-testid') : null,
          childCount: el.children ? el.children.length : 0
        });
        el = el.parentElement;
      }
      return path;
    });
    console.log('Search input parent structure:', JSON.stringify(searchContainerStructure, null, 2));

    // Get sibling elements of the search input
    const searchSiblings = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search destinations"]');
      if (!input) return null;
      const parent = input.parentElement;
      const grandParent = parent ? parent.parentElement : null;
      const ggParent = grandParent ? grandParent.parentElement : null;
      return {
        parentHtml: parent ? parent.outerHTML.substring(0, 1000) : null,
        grandParentHtml: grandParent ? grandParent.outerHTML.substring(0, 2000) : null,
        ggParentHtml: ggParent ? ggParent.outerHTML.substring(0, 3000) : null
      };
    });
    console.log('GGParent HTML (search area):', searchSiblings?.ggParentHtml?.substring(0, 3000));

  } catch(err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
