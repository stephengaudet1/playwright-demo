import { Page, Frame, type Locator } from '@playwright/test';
import { TimeEntryData } from '../data/interfaces';

const SEARCH_OFFSET = 1;
const SUNDAY = 'taskWeekDay1';
const MONDAY = 'taskWeekDay2';
const TUESDAY = 'taskWeekDay3';
const WEDNESDAY = 'taskWeekDay4';
const THURSDAY = 'taskWeekDay5';
const FRIDAY = 'taskWeekDay6';
const SATURDAY = 'taskWeekDay7';

export class TimeEntryPage {
    readonly page: Page;
    frame : Frame|null;

    constructor(page: Page) {
        this.page = page;
        this.frame = null;
    }

    async isRendered() : Promise<boolean> {
        this.frame  = await this.waitForFrameLoad1();
        await new Promise(f => setTimeout(f, 3000));
        await this.frame?.getByTitle('Expected date format Y-m-d.').first().isVisible();
        return true;
    }

    async saveTimeEntry(data : TimeEntryData) {
        this.dumpFrames();
        this.frame = await this.waitForFrameLoad();
        this.dumpFrames();
        await this.setDate(data.weekEnding);
        var i = 0;
        for(let project of data.projects) {
            i++;
            await this.frame.locator('.f-form-search-trigger').nth(i+SEARCH_OFFSET).click();
            await this.frame.locator('a', { hasText: project.project }).click();
            await this.frame.locator('//td[@data-qtip=\''+project.project+'\']/../following::a[text()=\'Add Tasks\']').click();
            for(let task of project.tasks) {
                //todo: handle toggle of "limit to tasks with matching assignment"
                await this.frame.locator('//span[text()=\''+task.task+'\']/ancestor::tr/td[contains(concat(\' \',normalize-space(@class),\' \'), \' f-selmodel-checkbox \')]').click();
                await this.frame.locator('//span[text()=\'Add Tasks\']').click();
                if(task.sunday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+SUNDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+SUNDAY+'\']/div[2]').pressSequentially(task.sunday.toString());
                }                
                if(task.monday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+MONDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+MONDAY+'\']/div[2]').pressSequentially(task.monday.toString());
                }
                if(task.tuesday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+TUESDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+TUESDAY+'\']/div[2]').pressSequentially(task.tuesday.toString());
                }
                if(task.wednesday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+WEDNESDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+WEDNESDAY+'\']/div[2]').pressSequentially(task.wednesday.toString());
                }
                if(task.thursday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+THURSDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+THURSDAY+'\']/div[2]').pressSequentially(task.thursday.toString());
                }
                if(task.friday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+FRIDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+FRIDAY+'\']/div[2]').pressSequentially(task.friday.toString());
                }
                if(task.saturday) {
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+SATURDAY+'\']').click();
                    await this.frame.locator('//a[text()=\''+task.task+'\']/ancestor::tr/td[@data-columnid=\''+SATURDAY+'\']/div[2]').pressSequentially(task.saturday.toString());
                }
            }
        }
        await this.frame.locator('//span[text()=\'Save\']').click();        
    }

    async getResource() : Promise<string|null> {
        this.frame = await this.waitForFrameLoad();
        const locator = await this.frame.getByPlaceholder('Search');
        const resource = await locator.getAttribute('value');
        return resource;
    }

    async addNewRow(index : number, project : string, task : string) {
        this.frame = await this.waitForFrameLoad();
        await new Promise(f => setTimeout(f, 3000));
        //todo: fix the hardcoded date to come from test data
        //await this.setDate('2024-11-30');
        await this.frame.locator('.f-form-search-trigger').nth(index+SEARCH_OFFSET).click();
        await this.frame.locator('a', { hasText: project }).click();
        await this.frame.locator('//td[@data-qtip=\'Sample Project\']/../following::a[text()=\'Add Tasks\']').click();
        await this.frame.locator('//span[text()=\''+task+'\']/ancestor::tr/td[contains(concat(\' \',normalize-space(@class),\' \'), \' f-selmodel-checkbox \')]').click();
        await this.frame.locator('//span[text()=\'Add Tasks\']').click();
        await this.frame.locator('//a[text()=\''+task+'\']/ancestor::tr/td[@data-columnid=\''+MONDAY+'\']').click();
        await this.frame.locator('//a[text()=\''+task+'\']/ancestor::tr/td[@data-columnid=\''+MONDAY+'\']/div[2]').pressSequentially('8');
        await this.frame.locator('//span[text()=\'Save\']').click();
    }

    async setDate(weekEnding : string) {
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
        await this.frame?.getByTitle('Expected date format Y-m-d.').first().fill(weekEnding);
        //I had to click "somewhere outside of the date input" to trigger the date's input event 
        await this.frame?.getByText('Time Entry', { exact: true }).click();
        //todo: try to get rid of this sleep
        await new Promise(f => setTimeout(f, 3000));
    }

    async waitForFrameLoad() : Promise<Frame> {
        var x = 0;
        while(x < 50) {
            for(var frame of this.page.frames()) {
                try {
                    await frame.waitForURL(new RegExp(/TimecardEntry/), { timeout: 1 });
                    return frame;
                }
                catch(e) {}
            }
            await new Promise(f => setTimeout(f, 500));
            x++;
        }
        throw new Error("TimeEntryPage: waitForFrameLoad: this is taking too long, something is wrong.");
    }

    //todo: improve this if you can
    async waitForFrameLoad1() : Promise<Frame> {
        return this.page.frames()[1];
    }

    async getTotals() : Promise<Array<number>> {
        //.f-grid-row-summary-item
        //sunday total:
        ////tr[contains(concat(' ',normalize-space(@class), ' '), ' f-grid-row-summary-item ')]/td[@data-columnid='weekDay1']
        //saturday is: weekDay7
        //total column is saturday's next sibling
        const row = await this.frame?.locator('.f-grid-row-summary-item');
        return new Array();
    }

    async getStatus() : Promise<string> {
        return 'todo';
    }
    async dumpFrames() {
        for(var frame of this.page.frames()) {
            console.log(frame.url());
        }    
    }    
}
