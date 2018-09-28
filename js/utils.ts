export function pointInRect(px : number, py : number, x : number, y : number, w : number, h : number) : boolean
{
    return !(px <= x || px >= x + w || py <= y || py >= y + h);
}