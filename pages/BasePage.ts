import { Page, Locator } from '@playwright/test';

/**
 * Shared header elements and helpers available on every amazon.de page.
 */
export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly searchCategory: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;
  readonly accountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('#nav-logo-sprites');
    this.searchBox = page.locator('#twotabsearchtextbox');
    this.searchButton = page.locator('#nav-search-submit-button');
    this.searchCategory = page.locator('#searchDropdownBox');
    this.cartLink = page.locator('#nav-cart');
    this.cartCount = page.locator('#nav-cart-count');
    this.accountLink = page.locator('#nav-link-accountList');
  }

  /**
   * Amazon sometimes shows a "continue shopping" interstitial and always shows
   * a cookie consent banner for EU visitors. Dismiss both if present.
   */
  async dismissInterstitials() {
    const continueShopping = this.page.getByRole('button', {
      name: /Weiter shoppen|Continue shopping/i,
    });
    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click();
      await this.page.waitForLoadState('domcontentloaded');
    }

    // The banner is injected by a script and can show up late (notably in Firefox).
    const acceptCookies = this.page.locator('#sp-cc-accept');
    try {
      await acceptCookies.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      return; // Banner not shown (e.g. consent cookie already set).
    }
    await acceptCookies.click();
    await acceptCookies.waitFor({ state: 'hidden' });
  }

  async search(term: string) {
    await this.searchBox.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCartCount(): Promise<number> {
    const text = (await this.cartCount.textContent())?.trim() ?? '0';
    return Number.parseInt(text, 10) || 0;
  }
}
