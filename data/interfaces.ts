
export interface EndToEndData {
    employee: EmployeeData;
}

export interface EmployeeData {
    id : string;
    first : string;
    last : string;
    email : string;
    nick : string;
    license : string;
    profile : string;
    manager : string;
    contact : Contact;
}

export interface Contact {
    lastname : string;
    account : string;
    salesforceUser : string;
    region : string;
    practice : string;
    calendar : string;
    employeeID : string;
}

export interface TimeEntryData {
    weekEnding : string;
    projects : TimeEntryProjectData[];
}

export interface TimeEntryProjectData {
    project : string;
    tasks : TimeEntryTaskData[];
}

export interface TimeEntryTaskData {
    task : string;
    sunday? : number;
    monday? : number;
    tuesday? : number;
    wednesday? : number;
    thursday? : number;
    friday? : number;
    saturday? : number;
}
