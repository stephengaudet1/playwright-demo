import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

export class ZephyrReporter implements Reporter {
    jirauser : string;
    jiratoken : string;
    zephtoken : string;
    zephyrbaseurl : string;
    zephyrbasepath : string;
    jirabaseurl : string;
    jirabasepath : string;    
    project : string;
    version : string;
    cycle : string;
    folder : string;
    autocreatetests : string;
    zephyrfoldertype : string;
    maxresults : string;
    testresults : Results;

    onTestEnd(test: TestCase, result: TestResult) {
        const execution = {} as Execution;
        const filename = test.parent.title.split('.')[0];
        const testname = test.title;
        execution.source = filename + '.' + testname;

        switch(result.status) {
            case 'failed':
                execution.result = 'Failed';
                break;
            case 'interrupted':
                execution.result = 'Failed';
                break;
            case 'timedOut':
                execution.result = 'Failed';
                break;
            case 'skipped':
                break;
            case 'passed':
                execution.result = 'Passed';
                break;
            default:
                throw new Error('ZephyrReporter: Error mapping status: Unexpected playwright test result: ' + result.status);
        }
        if(result.status !== 'skipped') this.testresults.executions.push(execution);
    }

    async onEnd(result: FullResult) {
        await this.importExecutions();
    }

    constructor(options: { customOption?: string } = {}) {
        require('dotenv').config();
        this.jirauser = process.env.JIRA_USER || '';
        this.jiratoken = process.env.JIRA_TOKEN || '';
        this.zephtoken = process.env.ZEPHYR_TOKEN || '';
        this.zephyrbaseurl = process.env.ZEPHYR_BASE_URI || '';
        this.zephyrbasepath = process.env.ZEPHYR_BASE_PATH || '';
        this.jirabaseurl = process.env.JIRA_BASE_URI || '';
        this.jirabasepath = process.env.JIRA_BASE_PATH || '';
        this.project = process.env.JIRA_PROJECT || '';
        this.version = process.env.JIRA_VERSION || '';
        this.cycle = process.env.ZEPHYR_CYCLE || '';
        this.folder = process.env.ZEPHYR_FOLDER || '';
        this.autocreatetests = process.env.ZEPHYR_AUTO_CREATE_TESTS || '';
        this.zephyrfoldertype = 'TEST_CYCLE';
        this.maxresults = '1000';
        this.testresults = {} as Results;
        this.testresults.version = 1;
        this.testresults.executions = new Array();
        if(this.project === '') throw new Error('ZephyrReporter: Missing env var: JIRA_PROJECT');
        if(this.zephtoken === '') throw new Error('ZephyrReporter: Missing env var: ZEPHYR_TOKEN');
        if(this.jiratoken === '') throw new Error('ZephyrReporter: Missing env var: JIRA_TOKEN');
    }

    async getVersionId() : Promise<number> {
        const h = new Headers();
        h.append("Content-Type", "application/json");
        h.append('Authorization', 'Basic ' + Buffer.from(this.jirauser + ":" + this.jiratoken).toString('base64'));
        const res = await fetch(this.jirabaseurl + this.jirabasepath + "project/" + this.project + "/versions", {
            method: 'GET',
            headers: h
        });
        const code : number = res.status;
        const body : string = await res.text();
        this.checkStatusCode(code, body, "Get Version Id");
        const versions : Version[] = JSON.parse(body);
        const version = versions.find((v) => v.name === this.version);
        if(version === undefined) throw new Error("ZephyrReporter: Project " + this.project + " does not have a version named " + this.version);
        return version.id;
    }

    async getFolderId() : Promise<number> {       
        const url = new URL(this.zephyrbaseurl + this.zephyrbasepath + 'folders');
        url.searchParams.append('projectKey', this.project);
        url.searchParams.append('folderType', this.zephyrfoldertype);
        url.searchParams.append('maxResults', this.maxresults);

        const h = new Headers();
        h.append("Content-Type", "application/json");
        h.append('Authorization', 'Bearer ' + this.zephtoken);

        const res = await fetch(url.href, {
            method: 'GET',
            headers: h
        });
        const code : number = res.status;
        const body : string = await res.text();
        this.checkStatusCode(code, body, "Get Folder Id");
        const folders : FolderResponse = JSON.parse(body);
        const folder = folders.values.find((f) => f.name === this.folder);
        if(folder === undefined) return -1;
        return folder.id;
    }

    async createFolder() : Promise<number> {
        const req : FolderRequest = {} as FolderRequest;
        req.folderType = this.zephyrfoldertype;
        req.name = this.folder;
        req.projectKey = this.project;

        const url = new URL(this.zephyrbaseurl + this.zephyrbasepath + 'folders');

        const h = new Headers();
        h.append("Content-Type", "application/json");
        h.append('Authorization', 'Bearer ' + this.zephtoken);

        const res = await fetch(url.href, {
            method: 'POST',
            headers: h, 
            body: JSON.stringify(req),
        });
        const code : number = res.status;
        const body : string = await res.text();
        this.checkStatusCode(code, body, "Create Folder");
        const folder : GenericCreateResponse = JSON.parse(body); 
        return folder.id;
    }

    checkStatusCode(code : number, body : string, message : string) {
        if(code >= 300) throw new Error("ZephyrReporter: " + message + " returned " + code + " and response body " + body);
    }

    async importExecutions() {
        const h = new Headers();
        h.append('Authorization', 'Bearer ' + this.zephtoken);

        //the import api is a multipart form post
        const fd = new FormData();

        //the first part is the test results zipped
        var AdmZip = require('adm-zip');
        var zip = new AdmZip();
        var content = JSON.stringify(this.testresults);
        await zip.addFile('results.json', Buffer.from(content, 'utf-8'), 'no comment');
        let buffer  = zip.toBuffer();
        const blob = new Blob([buffer], { type: 'application/zip' });   
        fd.append('file', blob, 'results.json');

        //the second part is a json string describing the zephyr test cycle to target with the import
        const cycle = {} as Cycle;
        cycle.description = 'very cool';
        cycle.folderId = await this.getFolderId();
        if (cycle.folderId <= 0) cycle.folderId = await this.createFolder();
        cycle.jiraProjectVersion = await this.getVersionId();
        cycle.name = this.cycle;
        const cycleblob = new Blob([JSON.stringify(cycle)], { type: 'application/json' });
        fd.append('testCycle', cycleblob);

        //post the multipart form data
        const url = new URL('https://api.zephyrscale.smartbear.com/v2/automations/executions/custom');
        url.searchParams.append('projectKey','BTP');
        url.searchParams.append('autoCreateTestCases','true');
        const res = await fetch(url.href, {
            method: 'POST',
            headers: h,
            body: fd
        });
        const code : number = res.status;
        const body : string = await res.text();
        this.checkStatusCode(code, body, "import");        
        console.log(body);
    }            
}

interface Version {
    id : number;
    name : string;
}

interface Folder {
    name : string;
    id : number;
}

interface FolderResponse {
    values : Folder[];
}

interface FolderRequest {
    name : string;
    projectKey : string;
    folderType : string;
}

interface Cycle {
    name : string;
    description : string;
    jiraProjectVersion : number;
    folderId : number;
}

interface GenericCreateResponse {
    id : number;
    message : string;
    errorCode : string;
}

interface Execution {
    source : string;
    result : string;
}

interface Results {
    version : number;
    executions : Execution[];
}

export default ZephyrReporter;
