import { test, expect } from '../fixtures';

test.describe('Amazon.de home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('loads with the correct title and URL', async ({ page }) => {
    await expect(page).toHaveURL(/amazon\.de/);
    await expect(page).toHaveTitle(/Amazon\.de/);
  });

  test('shows the main header elements', async ({ homePage }) => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.searchBox).toBeVisible();
    await expect(homePage.searchButton).toBeVisible();
    await expect(homePage.cartLink).toBeVisible();
    await expect(homePage.accountLink).toBeVisible();
  });

  test('cookie banner is gone after accepting', async ({ page }) => {
    await expect(page.locator('#sp-cc-accept')).toBeHidden();
  });

  test('cart is empty for a new visitor', async ({ homePage }) => {
    expect(await homePage.getCartCount()).toBe(0);
  });

  test('sign-in link leads to the login page', async ({ page, homePage }) => {
    await homePage.accountLink.click();
    await expect(page).toHaveURL(/\/ap\/signin/);
    await expect(page.locator('#ap_email, #ap_email_login').first()).toBeVisible();
  });

  test('logo navigates back to the home page', async ({ page, homePage }) => {
    await homePage.search('buch');
    await homePage.logo.click();
    await expect(page).toHaveURL(/amazon\.de\/(\?.*|ref=.*)?$/);
  });
});
