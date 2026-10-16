import { test as base } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';

type Pages = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
};

export const test = base.extend<Pages>({
  // Amazon converts prices to the visitor's local currency based on IP (e.g. USD on
  // GitHub's US runners). Pin the display currency to EUR via the preference cookie.
  context: async ({ context }, use) => {
    await context.addCookies([
      { name: 'i18n-prefs', value: 'EUR', domain: '.amazon.de', path: '/' },
    ]);
    await use(context);
  },
  homePage: async ({ page }, use) => use(new HomePage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
});

export { expect } from '@playwright/test';
