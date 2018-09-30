export class IONode
{
    public label : string;
    public onvalueset : Function;
    protected _value : number;
    public outputNodes : IONode[];
    public inputNode : IONode = null;

    constructor(label : string)
    {
        this.label = label;
        this._value = -1;
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
}