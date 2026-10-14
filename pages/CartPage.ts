import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly emptyCartHeading: Locator;
  readonly subtotal: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('#sc-active-cart [data-asin]').filter({ has: page.locator('.sc-product-title, .a-truncate') });
    this.emptyCartHeading = page.getByRole('heading', { name: /Einkaufswagen ist leer|cart is empty/i });
    this.subtotal = page.locator('#sc-subtotal-amount-activecart, #sc-subtotal-amount-buybox').first();
  }

  async open() {
    await this.page.goto('/gp/cart/view.html');
    await this.dismissInterstitials();
  }

  async deleteFirstItem() {
    await this.items.first().locator('input[value="Löschen"], input[value="Delete"], [data-action="delete"] input, button[data-action="delete"]').first().click();
  }
}
