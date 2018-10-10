import { GraphicsNode } from "./builder";
import { Gate } from "./gate";
import { SerializedObject } from "./circuit";

export class IONode
{
    public label : string;
    public onvalueset : Function;
    protected _value : number;
    public outputNodes : IONode[];
    public inputNode : IONode = null;

    public static NO_VALUE : -1;

    public graphicsNode : GraphicsNode = null;
    public id : number = -1;
    public parentGate : Gate = null;

    constructor(label : string)
    {
        this.label = label;
        this._value = IONode.NO_VALUE;
        this.outputNodes = [];
    }

    public get value() : number
    {
        return this._value;
    }

    public set value(value : number)
    {
        this._value = value & 1;
        this.onvalueset && this.onvalueset(this._value);
    }

    public propagate() : void
    {
        if (this.value === IONode.NO_VALUE) return;

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

        this.outputNodes.forEach((outputNode, oi) =>
        {
                let ogate = outputNode.parentGate;
    
                let o =
                {
                    outputIndex: oi,
                    connectingToId: ogate.id,
                    connectingToInputIndex: ogate.indexOfInput(outputNode)
                };
    
                ret.outputConnections.push(o);
        });

        return ret;
    }
}