import { type Page, type Locator } from '@playwright/test';
import { Contact } from '../data/interfaces';

export class AdminContactsPage {
    readonly page: Page;

    constructor(page: Page) {
        require('dotenv').config();
        this.page = page;
    }

    async newContact(contact : Contact) {
        await this.page.getByTitle('App Launcher').click();
        await this.page.getByPlaceholder('Search apps and items...').fill('PLATO - PSA');
        await this.page.locator('//a[@data-label=\'PLATO - PSA\']').click();
        await this.page.getByTitle('Contacts').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
        const thing : Locator = this.page.getByRole('button', { name: 'New' });
        await thing.waitFor({state: 'visible'});
        await thing.click();
        const thingy : Locator = this.page.locator('//span[text()=\'PSA Resource\']/parent::div/preceding-sibling::div');
        await thingy.waitFor({state: 'visible'});
        await thingy.click();
        await this.page.getByRole('button', { name: 'Next' }).click();
        await this.page.getByLabel('Last Name').fill(contact.lastname);
        
        await this.page.getByLabel('*Account Name').fill(contact.account);
        await this.page.getByLabel('*Account Name').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 1000));
        await this.page.getByLabel('New Contact: PSA Resource').getByTitle(contact.account, { exact: true }).click();
        console.log("The new user is " + contact.salesforceUser);
        
        await this.page.getByLabel('Salesforce User').click();
        await this.page.getByLabel('Salesforce User').fill(contact.salesforceUser);
        await this.page.getByLabel('Salesforce User').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 1000));
        await this.page.getByTitle('Show more results for "'+contact.salesforceUser+'"').click();
        await this.page.locator('//span[@class=\'slds-radio\']').click();
        await this.page.getByRole('button', { name: 'Select', exact: true }).click();        
        
        await this.page.getByLabel('Region').fill(contact.region);
        await this.page.getByLabel('Region').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 1000));
        await this.page.getByTitle(contact.region, { exact: true }).click();
        
        await this.page.getByLabel('Practice').fill(contact.practice);
        await this.page.getByLabel('Practice').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 1000));
        await this.page.getByTitle(contact.practice, { exact: true }).click();

        await this.page.getByLabel('Is Resource', {exact: true}).check();
        await this.page.getByLabel('Is Resource Active').check();
        
        await this.page.getByLabel('Work Calendar').fill(contact.calendar);
        await this.page.getByLabel('Work Calendar').click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 1000));
        await this.page.getByTitle('Show more results for "'+contact.calendar+'"').click();
        await this.page.locator('//span[@class=\'slds-radio\']').click();
        await this.page.getByRole('button', { name: 'Select', exact: true }).click();

        await this.page.getByLabel('Employee ID').fill(contact.employeeID);
        await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    }
}
