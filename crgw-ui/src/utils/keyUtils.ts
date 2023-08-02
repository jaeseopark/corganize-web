export const getKeyDownLookupKey = (e: any) => {
    let lookupKey = "";
    lookupKey += e.shiftKey ? "^" : ".";
    lookupKey += e.ctrlKey ? "^" : ".";
    lookupKey += e.metaKey ? "^" : ".";
    return lookupKey + e.key.toLowerCase();
}
