import { SerializedObject } from "./interfaces";
import { GraphicsNode } from "./graphicsnode";
import { IONode } from "./ionode";
import { pointInRect } from "./utils";
import { Canvas } from "./canvas";
import { CircuitGate } from "./gate";
import { BuilderContainer } from "./buildercontainer";


export class GraphicsGate
{
    public width : number = 64;
    public height : number = 24;
    public color : string = "#fff";
    public gate : CircuitGate;
    public nodeSize : number = 12;
    private nodePadding : number = 8;
    public hovered : boolean = false;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer, gate : CircuitGate)
    {
        this.parent = parent;
        this.gate = gate;
        let nodes = Math.max(gate.numInputs, gate.numOutputs);
        this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
        this.width = 24 + ((64-24)/3) * this.gate.label.length;
    }

    public get x() : number
    {
        return this.gate.x;
    }

    public get y() : number
    {
        return this.gate.y;
    }

    public set x(x)
    {
        this.gate.x = x;
    }

    public set y(y)
    {
        this.gate.y = y;
    }

    public get id() : number
    {
        return this.gate.id;
    }

    public set id(id)
    {
        this.gate.id = id;
    }

    public toHTMLElement() : HTMLElement
    {
        let c = new Canvas({ width: this.width + this.nodeSize * 2, height: this.height + 8 });

        let _x = this.x;
        let _y = this.y;

        this.x = this.nodeSize;
        this.y = 4;
        this.drawGate(c);
        this.drawNodes(c, true);
        this.drawNodes(c, false);

        let container = document.createElement("div");
        container.className = "gate";
        container.appendChild(c.canvas);

        this.x = _x;
        this.y = _y;

        return container;
    }

    public drawGate(canvas : Canvas) : void
    {
        //this.drawNodes(canvas, true);
        //this.drawNodes(canvas, false);

        canvas.fillRoundedRect(this.x, this.y, this.width, this.height, 5, this.color, false);
        canvas.drawRoundedRect(this.x, this.y, this.width, this.height, 5, "#333333", 2, false);
        canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "#333333", "middle", "center", "24px monospace");
    }

    public drawNodes(canvas : Canvas, input : boolean, drawLabels? : boolean) : void
    {
        if (drawLabels === undefined) drawLabels = this.hovered;

        let fn = input ? this.gate.forEachInput : this.gate.forEachOutput;

        fn.call(this.gate, (node : IONode, i : number) =>
        {
            node.noValueColor = this.color;
            let pt = this.nodePoint(i, input);

            canvas.fillRoundedRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                5,
                node.color,
                false
            );

            canvas.drawRoundedRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                3,
                "#333333",
                2,
                false
            );

            if (drawLabels)
            {
                let fontSize = 14;
                let fontSize2 = fontSize + 2;
    
                canvas.fillText(
                    node.label,
                    pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2),
                    pt.y + this.nodeSize / 2,
                    "white",
                    "middle",
                    input ? "right" : "left",
                    fontSize + "px monospace"
                );
    
                canvas.fillText(
                    node.label,
                    pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2),
                    pt.y + this.nodeSize / 2,
                    "#333333",
                    "middle",
                    input ? "right" : "left",
                    fontSize + "px monospace"
                );
            }
        });
    }

    public nodePoint(index : number, input : boolean, corrected? : boolean) : { x : number, y : number }
    {
        if (corrected === undefined) corrected = false;
        
        let numNodes = input ? this.gate.numInputs : this.gate.numOutputs;
        let padding = (this.height - numNodes * this.nodeSize) / (numNodes + 1);

        return {
            x: this.x - (corrected ? 0 : this.nodeSize / 2) + (input ? 0 : this.width),
            y: this.y + padding * (index + 1) + this.nodeSize * index + (corrected ? this.nodeSize / 2 : 0)
        };
    }

    public containsPoint(x : number, y : number) : boolean
    {
        return pointInRect(x, y, this.x - this.nodeSize, this.y, this.width + this.nodeSize * 2, this.height);
    }

    public nodeIndexFromY(y : number, input : boolean) : number
    {
        let slices = input ? this.gate.numInputs : this.gate.numOutputs;
        let localY = y - this.y;
        let h = this.height / slices;

        return ~~(localY / h);
    }

    public getConnectingOutput(y : number) : number
    {
        return this.nodeIndexFromY(y, false);
    }

    public getConnectingInput(y : number) : number
    {
        return this.nodeIndexFromY(y, true);
    }

    public connect(output : number, gate : GraphicsGate, input : number) : IONode
    {
        let o = this.gate.connect(output, gate.gate, input);

        if (o.result.success)
        {
            return o.result.oustedNode;
        }
        else
        {
            o.srcNode.disconnect(o.destNode);
            return null;
        }
    }

    public connectNode(output : number, node : GraphicsNode) : IONode
    {
        let o = this.gate.connectNode(output, node.node);

        if (o.result.success)
        {
            return o.result.oustedNode;
        }
        else
        {
            o.srcNode.disconnect(o.destNode);
        }
    }

    public serialize() : SerializedObject
    {
        return this.gate.serialize();
    }
}