import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly results: Locator;
  readonly resultTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.results = page.locator('[data-component-type="s-search-result"]');
    this.resultTitles = this.results.locator('h2');
  }

  /** Opens the product page of the n-th organic (non-sponsored) result. */
  async openResult(index = 0) {
    const organic = this.results.filter({
      hasNot: this.page.locator('.puis-sponsored-label-text, .s-sponsored-label-text'),
    });
    const link = organic.nth(index).locator('a:has(h2), h2 a').first();
    const href = await link.getAttribute('href');
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    if (await this.continueIfBotCheck() && href) {
      await this.page.goto(href);
    }
  }
}
