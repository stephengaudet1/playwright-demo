import { type Locator, type Page } from '@playwright/test';

export class ManagerHomePage {
    readonly page: Page;
    readonly timecards: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.timecards = page.getByText('Timecards to Approve');
    }

    async isRendered() : Promise<boolean> {
        await this.timecards.waitFor({ state: 'visible'});
        return this.timecards.isVisible();
    }
}
