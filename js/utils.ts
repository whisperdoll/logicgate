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

export function createElement(type : string, className : string = "") : HTMLElement
{
    let ret : HTMLElement = document.createElement(type);
    ret.className = className;
    return ret;
}

function numberToBinaryArray(n : number, numBits : number) : number[]
{
    let ret = [];

    do
    {
        let bit = n & 1;
        ret.unshift(bit);
        n >>= 1;
    } while (n > 0 && ret.length < numBits);

    while (ret.length < numBits)
    {
        ret.unshift(0);
    }

    return ret;
}

export function inputCombos(length : number) : number[][]
{
    let ret = [];
    
    let iterations = length * length;
    
    for (let i = 0; i < iterations; i++)
    {
        ret.push(numberToBinaryArray(i, length));
    }

    return ret;
}