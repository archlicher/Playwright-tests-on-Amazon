import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly title: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly mainImage: Locator;

  constructor(page: Page) {
    super(page);
    // A hidden <input id="productTitle"> also exists on the page, so target the visible span.
    this.title = page.locator('span#productTitle');
    this.price = page.locator('#corePrice_feature_div .a-price, #corePriceDisplay_desktop_feature_div .a-price').first();
    this.addToCartButton = page.locator('#add-to-cart-button');
    this.mainImage = page.locator('#landingImage, #imgBlkFront').first();
  }

  async addToCart() {
    await this.addToCartButton.click();
    // Amazon may offer warranty / accessory upsells in a side sheet; decline them.
    const noThanks = this.page.getByRole('button', { name: /Nein, danke|No thanks/i });
    if (await noThanks.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await noThanks.click();
    }
  }
}
