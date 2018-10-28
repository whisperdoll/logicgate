export function pointInRect(px : number, py : number, x : number, y : number, w : number, h : number) : boolean
{
    return !(px <= x || px >= x + w || py <= y || py >= y + h);
}

export function hideElement(element)
{
    element.style.display = "none";
}

export function showElement(element)
{
    element.style.display = "";
}

export function cloneJSON(o)
{
    return JSON.parse(JSON.stringify(o));
}

export function concatSet(set : Set<any>, otherSet : Set<any>)
{
    otherSet.forEach((item : any) => set.add(item));
}