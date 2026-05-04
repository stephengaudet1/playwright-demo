import { type Page, type Frame, type Locator } from '@playwright/test';
import { EmployeeData, Contact } from '../data/interfaces';

export class AdminUsersPage {
    readonly url : string;
    readonly page : Page;
    frame : Frame|null;
    
    constructor(page: Page) {
        require('dotenv').config();
        this.url = process.env.SETUP + 'lightning/setup/ManageUsers/home';
        this.page = page;
        this.frame = null;
    }

    async goto() {
        await this.page.goto(this.url);
        this.frame = await this.waitForFrameLoad();
    }

    async loginAs(firstname: string, lastname: string) {
        await this.goto();
        await this.frame?.getByText(lastname.charAt(0).toUpperCase(), {exact: true}).first().click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
        this.frame = await this.waitForFrameLoadNewUser();
        await this.frame.locator('//a[text()=\'' + lastname + ', ' + firstname + '\']/ancestor::tr//a[text()=\'Login\']').click();
    }

//todo: change the loginAs function so that it works for both employee and manager, then remove this silly loginAsXMan function
//its a simple fix, just use email address instead of first and last name when locating the correct login link
async loginAsXMan() {
    await this.goto();
    await this.frame?.getByText('X', {exact: true}).first().click();
    await new Promise(f => setTimeout(f, 3000));
    this.frame = await this.waitForFrameLoadNewUser();
    await this.frame.locator('//a[text()=\'xautomationxmanager@woot.com\']/ancestor::tr//a[text()=\'Login\']').click();
}

    async newEmployee(user : EmployeeData) {
        await this.goto();
        await this.frame?.getByRole('button', { name: 'New User' }).first().click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
        var f = await this.waitForFrameLoadNewUser();
        const id: string = Date.now().toString();
        await f.getByLabel('First Name').fill(user.first);
        await f.getByLabel('Last Name').fill(user.last);
        await f.getByLabel('*Email', { exact: true }).fill(user.email);
        await f.getByLabel('Nickname').fill(user.id);
        await f.getByLabel('User License').selectOption(user.license);
        await f.getByLabel('Profile').selectOption(user.profile);
        await f.getByLabel('Manager').scrollIntoViewIfNeeded();
        await f.getByLabel('Manager').fill(user.manager);
        await f.getByLabel('Generate new password and notify user immediately').click();
        await f.getByRole('row', { name: 'Save Save & New Cancel', exact: true }).locator('input[name="save"]').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
        f = await this.waitForFrameLoadNewUser();
    }

    async waitForFrameLoad() : Promise<Frame> {
        var x = 0;
        while(x < 50) {
            for(var frame of this.page.frames()) {
                try {
                    await frame.waitForURL(new RegExp(/UserEntity/), { timeout: 1 });
                    return frame;
                }
                catch(e) {}
            }
            await new Promise(f => setTimeout(f, 500));
            x++;
        }
        throw new Error("ManageUsersPage: waitForFrameLoad: this is taking too long, something is wrong.");
    }    

    async waitForFrameLoadActiveUsers() : Promise<Frame> {
        var x = 0;
        while(x < 50) {
            for(var frame of this.page.frames()) {
                try {
                    await frame.waitForURL(new RegExp(/Active Users/), { timeout: 1 });
                    return frame;
                }
                catch(e) {}
            }
            await new Promise(f => setTimeout(f, 500));
            x++;
        }
        throw new Error("ManageUsersPage: waitForFrameLoadActiveUsers: this is taking too long, something is wrong.");
    }    

    //todo: improve this if you can
    async waitForFrameLoadNewUser() : Promise<Frame> {
        return this.page.frames()[1];
    }

    async dumpFrames() {
        for(var frame of this.page.frames()) {
            console.log(frame.url());
        }    
    }
}
