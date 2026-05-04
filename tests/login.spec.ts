import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { AdminHomePage } from '../pages/admin-home-page';

test('admin login', async ({ page }, testInfo) => {
        require('dotenv').config();
        const user = process.env.ADMIN_USER || '';
        const pwd = process.env.ADMIN_PWD || '';
        const loginPage = new LoginPage(page);
        const homePage = new AdminHomePage(page);
        await loginPage.login(user, pwd);
        const pageRendered = await homePage.isRendered();
        expect(pageRendered).toBe(true);
});
