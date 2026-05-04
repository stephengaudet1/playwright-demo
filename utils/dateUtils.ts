export function nextFridayString(date?: Date) : string {
    if (date===undefined) date = new Date(Date.now());
    var day = date.getDay();
    var friday = 5;
    var offset = friday - day;
    if (offset < 0) offset = offset + 7;
    date.setDate(date.getDate() + offset);
    return timeEntryDateString(date);
}

export function timeEntryDateString(date : Date) : string {
    return date.toISOString().split("T")[0];
}