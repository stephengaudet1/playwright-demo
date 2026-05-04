import { TimeEntryData } from '../data/interfaces';
import { test } from '../fixtures/endToEnd';
import { expect } from '@playwright/test';
import { TimeEntryPage } from '../pages/employee-timeentry-page';
import { nextFridayString } from '../utils/dateUtils';

const fs = require('fs');
const tcDir = './tests/timeentry/';

fs.readdirSync(tcDir).forEach((testcase: string) => {
  test('timeentry end to end ' + testcase.split(".")[0], async ({ employee, manager, data }) => {

    var t : TimeEntryData = JSON.parse(fs.readFileSync(tcDir + testcase));
    t.weekEnding = nextFridayString();
    
    const timeEntryPage : TimeEntryPage = new TimeEntryPage(employee);
    
    await timeEntryPage.saveTimeEntry(t);

    const totals : number[] = await timeEntryPage.getTotals();
    //assert totals vs expected values to be found in timeentry data

    const timeEntryStatus : string = await timeEntryPage.getStatus();
    expect(timeEntryStatus).toEqual("Submitted");
    await manager.pause();
  });
});
