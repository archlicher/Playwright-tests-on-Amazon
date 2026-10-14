import { test, expect } from '../fixtures';

test.describe('Product page and cart', () => {
  test.beforeEach(async ({ homePage, searchResultsPage }) => {
    await homePage.open();
    await homePage.search('USB C Kabel');
    await searchResultsPage.openResult(0);
  });

  test('product page shows title, price, image and add-to-cart', async ({ productPage }) => {
    await expect(productPage.title).toBeVisible();
    await expect(productPage.title).not.toBeEmpty();
    await expect(productPage.mainImage).toBeVisible();
    await expect(productPage.price).toContainText('€');
    await expect(productPage.addToCartButton).toBeVisible();
  });

  test('adding a product increases the cart count', async ({ productPage }) => {
    await productPage.addToCart();
    await expect(productPage.cartCount).toHaveText('1');
  });

  test('added product appears in the cart and can be removed', async ({ productPage, cartPage }) => {
    const productTitle = (await productPage.title.innerText()).trim();
    await productPage.addToCart();
    await expect(productPage.cartCount).toHaveText('1');

    await cartPage.open();
    await expect(cartPage.items).toHaveCount(1);
    // Cart titles are truncated, so compare against the start of the product title.
    await expect(cartPage.items.first()).toContainText(productTitle.slice(0, 20));
    await expect(cartPage.subtotal).toContainText('€');

    await cartPage.deleteFirstItem();
    await expect(cartPage.cartCount).toHaveText('0');
  });
});
