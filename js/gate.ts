import { IONode } from "./ionode"

export class Gate
{
    public inputNodes : IONode[];
    public outputNodes : IONode[];
    public label : string;

    constructor()
    {
        
    }
}

export class OpGate extends Gate
{
    constructor()
    {
        super();
        
        this.inputNodes =
        [
            new IONode("input1"),
            new IONode("input2")
        ];

        this.inputNodes[0].onvalueset = this.nodeFn.bind(this);
        this.inputNodes[1].onvalueset = this.nodeFn.bind(this);

        this.outputNodes =
        [
            new IONode("output")
        ];
    }

    private nodeFn() : void
    {
        if (this.inputNodes[0].value !== -1 && this.inputNodes[1].value !== -1)
        {
            this.outputNodes[0].value = this.gateFn();
        }
    }

    protected gateFn() : number
    {
        return -1;
    }
}

export class ANDGate extends OpGate
{
    constructor()
    {
        super();
        this.label = "AND";
    }

    protected gateFn() : number
    {
        return this.inputNodes[0].value & this.inputNodes[1].value;
    }
}

export class ORGate extends OpGate
{
    constructor()
    {
        super();
        this.label = "OR";
    }

    protected gateFn() : number
    {
        return this.inputNodes[0].value | this.inputNodes[1].value;
    }
}

export class XORGate extends OpGate
{
    constructor()
    {
        super();
        this.label = "XOR";
    }

    protected gateFn() : number
    {
        return this.inputNodes[0].value ^ this.inputNodes[1].value;
    }
}