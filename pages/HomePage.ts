import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async open() {
    await this.page.goto('/');
    await this.dismissInterstitials();
  }
}
