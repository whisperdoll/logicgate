import { GraphicsNode } from "./graphicsnode";
import { Gate } from "./gate";
import { SerializedObject } from "./interfaces";

export class IONode
{
    public label : string;
    public onvalueset : Function;
    protected _value : number;
    public outputNodes : IONode[];
    public inputNode : IONode = null;
    public noValueColor : string = "white";

    public static NO_VALUE : number = -1;
    public static COLOR_0 : string = "#8888FF";
    public static COLOR_1 : string = "#FF8844";

    public graphicsNode : GraphicsNode = null;
    public id : number = -1;
    public parentGate : Gate = null;

    constructor(label : string)
    {
        this.label = label;
        this._value = IONode.NO_VALUE;
        this.outputNodes = [];
    }

    public get color() : string
    {
        switch (this.value)
        {
            case 0: return IONode.COLOR_0;
            case 1: return IONode.COLOR_1;
            default: return this.noValueColor;
        }
    }

    public get value() : number
    {
        return this._value;
    }

    public set value(value : number)
    {
        this._value = value;
        this.onvalueset && this.onvalueset(this._value);
        this.propagate();
    }

    public propagate() : void
    {
        //if (this.value === IONode.NO_VALUE) return;

        this.outputNodes.forEach(node => node.value = this._value);
    }

    public connect(node : IONode) : { success: boolean, oustedNode: IONode }
    {
        let ret = {
            oustedNode: null,
            success: false
        };

        if (this.outputNodes.indexOf(node) === -1)
        {
            this.outputNodes.push(node);
            ret.oustedNode = node.inputNode;

            if (node.inputNode)
            {
                node.inputNode.disconnect(node);
            }

            this.propagate();

            node.inputNode = this;
            ret.success = true;
        }

        return ret;
    }

    public disconnect(node : IONode)
    {
        let i = this.outputNodes.indexOf(node);
        if (i !== -1)
        {
            this.outputNodes.splice(i, 1);
            node.inputNode = null;
        }
    }

    public serialize(isInput : boolean) : SerializedObject
    {
        let ret = {
            type: isInput ? "inputNode" : "outputNode",
            id: this.id,
            label: this.label,
            x : 0,
            y : 0,
            outputConnections: []
        };

        this.outputNodes.forEach((node, oi) =>
        {
            let cid : number;
            let cind : number;

            if (node.parentGate.id === -1)
            {
                cid = node.id;
                cind = -1;
            }
            else
            {
                let ogate = node.parentGate;
                cid = ogate.id;
                cind = ogate.indexOfInput(node);
            }

            let o =
            {
                outputIndex: oi,
                connectingToId: cid,
                connectingToInputIndex: cind
            };

            ret.outputConnections.push(o);
        });

        return ret;
    }
}