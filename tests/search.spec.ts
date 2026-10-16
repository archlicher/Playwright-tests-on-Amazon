import { test, expect } from '../fixtures';

/**
 * Amazon's JS search handler puts the term in `k=`; if the form is submitted before
 * that script is ready, the plain HTML form uses `field-keywords=` instead.
 */
const searchUrl = (term: string) => new RegExp(`[?&](k|field-keywords)=${term}(&|$)`);

test.describe('Search', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('returns relevant results for a keyword', async ({ page, homePage, searchResultsPage }) => {
    await homePage.search('Kindle');

    await expect(page).toHaveURL(searchUrl('Kindle'));
    await expect(searchResultsPage.results.first()).toBeVisible();
    expect(await searchResultsPage.results.count()).toBeGreaterThan(5);

    const titles = await searchResultsPage.resultTitles.allInnerTexts();
    expect(titles.some((t) => /kindle/i.test(t))).toBeTruthy();
  });

  test('keeps the search term in the search box', async ({ homePage, searchResultsPage }) => {
    await homePage.search('Kaffeemaschine');
    await expect(searchResultsPage.searchBox).toHaveValue('Kaffeemaschine');
  });

  test('can be submitted with the Enter key', async ({ page, homePage, searchResultsPage }) => {
    await homePage.searchBox.fill('Lego');
    await homePage.searchBox.press('Enter');
    await expect(page).toHaveURL(searchUrl('Lego'));
    await expect(searchResultsPage.results.first()).toBeVisible();
  });

  test('shows autocomplete suggestions while typing', async ({ page, homePage }) => {
    await homePage.searchBox.pressSequentially('iphon', { delay: 100 });
    const suggestions = page.locator('.s-suggestion, [id^="sac-suggestion-row"]');
    await expect(suggestions.first()).toBeVisible();
  });

  test('should filter products when searching', async ({ page }) => {
    const searchInput = page.locator('#twotabsearchtextbox');
    await searchInput.fill('laptop');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(searchUrl('laptop'));
    const productTitles = page.locator('.s-title-instructions-style');
    await expect(productTitles.first()).toBeVisible();
    const titles = await productTitles.allInnerTexts();
    expect(titles.some((t) => /laptop/i.test(t))).toBeTruthy();
  });

  test('can be restricted to a category', async ({ page, homePage, searchResultsPage }) => {
    await homePage.searchCategory.selectOption({ value: 'search-alias=stripbooks' });
    await homePage.search('Harry Potter');
    await expect(page).toHaveURL(/(i=|search-alias%3D)stripbooks/);
    await expect(searchResultsPage.results.first()).toBeVisible();
  });

  test('handles nonsense queries gracefully', async ({ page, homePage, searchResultsPage }) => {
    const term = 'qxzvbnmwplkjhgfdsazxqw';
    await homePage.search(term);

    // Amazon either shows a "no results" message or falls back to loosely related items.
    await expect(page).toHaveURL(searchUrl(term));
    await expect(searchResultsPage.searchBox).toHaveValue(term);
    const titles = await searchResultsPage.resultTitles.allInnerTexts();
    expect(titles.filter((t) => t.toLowerCase().includes(term))).toHaveLength(0);
  });
});
