import { test as base } from '@playwright/test';
import { type Page } from '@playwright/test';
import { EndToEndData, EmployeeData, Contact, TimeEntryData } from '../data/interfaces';
import { LoginPage } from '../pages/login-page';
import { AdminUsersPage } from '../pages/admin-users-page';
import { AdminContactsPage } from '../pages/admin-contacts-page';
import { TimeEntryPage } from '../pages/employee-timeentry-page';
import { ManagerHomePage } from '../pages/manager-home-page';
import { nextFridayString } from '../utils/dateUtils';

interface EndToEnd {
    manager: Page;
    employee: Page;
    data: EndToEndData;
}

export const test = base.extend<EndToEnd>({

    data: async ({browser}, use) => {
        require('dotenv').config();

        var data = {} as EndToEndData;
        const id : string = Date.now().toString();

        var user = {} as EmployeeData;
        user.id = id;
        user.first = process.env.USER_PREFIX + id;
        user.last = process.env.USER_PREFIX + id;
        user.email = id + '@' + process.env.USER_EMAIL_DOMAIN;
        user.nick = id;
        user.license = process.env.EMPLOYEE_LICENSE || '';
        user.profile = process.env.EMPLOYEE_PROFILE || '';
        user.manager = process.env.MANAGER || '';
        
        var contact = {} as Contact;
        contact.lastname = user.last;
        contact.account = process.env.CONTACT_ACCOUNT || '';
        contact.salesforceUser = user.first + ' ' + user.last;
        contact.region = process.env.CONTACT_REGION || '';
        contact.practice = process.env.CONTACT_PRACTICE || '';
        contact.calendar = process.env.CONTACT_CALENDAR || '';
        contact.employeeID = user.id;
        user.contact = contact;
        data.employee = user;

        await use(data);
    },

    employee: async ({browser, data}, use, testInfo) => {
        require('dotenv').config();
        const context = await browser.newContext();
        var employee: Page = await context.newPage();
        const user = process.env.ADMIN_USER || '';
        const pwd = process.env.ADMIN_PWD || '';
        const loginPage = new LoginPage(employee);
        const usersPage = new AdminUsersPage(employee);
        const contactsPage = new AdminContactsPage(employee);
        const timeEntryPage = new TimeEntryPage(employee);
        await loginPage.login(user, pwd);
        await usersPage.newEmployee(data.employee);
        await contactsPage.newContact(data.employee.contact);
        await usersPage.loginAs(data.employee.first, data.employee.last);
        while(context.pages().length === 1) {
            await new Promise(f => setTimeout(f, 500));
        }
        const tabs = context.pages();
        employee = tabs[1];
        tabs[0].close();
        await use(employee);
        if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
            const buffer = await employee.screenshot();
            testInfo.attach(testInfo.title + '_employee.png', { body: buffer, contentType: 'image/png'});
        }             
        //todo
        //await logoutAs(employee)
        //await delete(employee)
        //await logout(admin)
    },

    manager: async ({browser, data, employee}, use, testInfo) => {
        require('dotenv').config();
        const context = await browser.newContext();
        var manager: Page = await context.newPage();
        const user = process.env.ADMIN_USER || '';
        const pwd = process.env.ADMIN_PWD || '';
        const loginPage = new LoginPage(manager);
        const usersPage = new AdminUsersPage(manager);
        const homePage = new ManagerHomePage(manager);
        await loginPage.login(user, pwd);
        await usersPage.loginAsXMan();
        while(context.pages().length === 1) {
            await new Promise(f => setTimeout(f, 500));
        }
        const tabs = context.pages();
        manager = tabs[1];
        tabs[0].close();
        await use(manager);
        if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
            const buffer = await manager.screenshot();
            testInfo.attach(testInfo.title + '_manager.png', { body: buffer, contentType: 'image/png'});
        }  
        //todo
        //await logoutAs(manager)
        //await logout(admin)
    }
})
