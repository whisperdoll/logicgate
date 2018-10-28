import { BuilderContainer } from "./buildercontainer";
import { IONode } from "./ionode";
import { Canvas } from "./canvas";
import { pointInRect } from "./utils";


export class GraphicsNode
{
    public x : number = 0;
    public y : number = 0;
    public size : number = 32;
    public node : IONode;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer, node : IONode)
    {
        this.parent = parent;
        this.node = node;
    }

    public get id() : number
    {
        return this.node.id;
    }

    public set id(id : number)
    {
        this.node.id = id;
    }

    public draw(canvas : Canvas) : void
    {
        canvas.fillCircleInSquare(this.x, this.y, this.size, this.node.color);
        canvas.drawCircleInSquare(this.x, this.y, this.size, "#333333", 2);

        if (this.node.value !== IONode.NO_VALUE)
        {
            canvas.fillText(this.node.value, this.cx, this.cy, "#333333",
                "middle", "center", "16px monospace");
        }
    }

    public get cx() : number
    {
        return this.x + this.size / 2;
    }

    public get cy() : number
    {
        return this.y + this.size / 2;
    }

    public set cx(cx : number)
    {
        this.x = cx - this.size / 2;
    }

    public set cy(cy : number)
    {
        this.y = cy - this.size / 2;
    }

    public containsPoint(x : number, y : number) : boolean
    {
        return pointInRect(x, y, this.x, this.y, this.size, this.size);
    }
}