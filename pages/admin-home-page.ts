import { type Locator, type Page } from '@playwright/test';

export class AdminHomePage {
    readonly page: Page;
    readonly myProjects: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.myProjects = page.getByText('My Projects');
    }

    async isRendered() : Promise<boolean> {
        await this.myProjects.waitFor({ state: 'visible'});
        return this.myProjects.isVisible();
    }
}
