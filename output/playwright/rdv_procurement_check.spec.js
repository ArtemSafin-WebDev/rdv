const { test, expect } = require('@playwright/test');

test('procurement block and more button behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });

  const section = page.locator('.procurement-projects').first();
  await expect(section).toBeVisible();

  await section.screenshot({ path: 'output/playwright/procurement-1920-before.png' });

  const firstPanel = page.locator('.procurement-projects__panel.active').first();
  const moreButton = firstPanel.locator('.procurement-projects__tags-more');
  const hiddenTags = firstPanel.locator('.procurement-projects__tag--hidden');

  const hiddenBefore = await hiddenTags.count();
  expect(hiddenBefore).toBeGreaterThan(0);
  await expect(moreButton).toBeVisible();

  await moreButton.click();

  await expect(hiddenTags).toHaveCount(0);
  await expect(moreButton).toBeHidden();

  await section.screenshot({ path: 'output/playwright/procurement-1920-after-click.png' });
  await page.screenshot({ path: 'output/playwright/page-1920-full.png', fullPage: true });
});
