import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly url: string;
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly submit: Locator;
    
    constructor(page: Page) {
        require('dotenv').config();
        this.url = process.env.SUT ||'';
        this.page = page;
        this.username = page.getByLabel('Username');
        this.password = page.getByLabel('Password');
        this.submit = page.locator('input', { hasText: 'Log In to Sandbox' });
    }

    async login(user : string, pwd : string) {
        await this.goto();
        await this.username.fill(user);
        await this.password.fill(pwd);
        await this.submit.click();
    }

    async goto() {
        await this.page.goto(this.url);
    }
}
