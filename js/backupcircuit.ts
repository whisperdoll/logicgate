/*import { Gate, ANDGate, ORGate, XORGate } from "./gate"
import { IONode } from "./ionode";
import { GraphicsGate, Builder, GraphicsNode } from "./builder";
import challenges from "./challenges";

export interface SerializedObject
{
    type : string;
    id : number;
    label : string;
    outputConnections : { outputIndex : number, connectingToId : number, connectingToInputIndex: number }[];
}

export class Circuit
{
    private gates : Circuit[] = [];
    public inputNodes : CircuitNode[] = [];
    public outputNodes : CircuitNode[] = [];

    private idPool : number[] = [];
    private idCounter = 0;

    public label : string;
    public type : string;
    public id : number;

    public builder : Builder = null;

    public static list : {} = {};

    public static load() : void
    {
        // construct circuits for gates //
        Circuit.addToList(new Circuit("AND", "AND").addGate(new ANDGate()).parent);
        Circuit.addToList(new Circuit("OR", "OR").addGate(new ORGate()).parent);
        Circuit.addToList(new Circuit("XOR", "XOR").addGate(new XORGate()).parent);

        for (let type in challenges)
        {
            Circuit.addToList(Circuit.parse(challenges[type].solution));
        }
    }

    private static addToList(circuit : Circuit) : void
    {
        Circuit.list[circuit.type] = circuit;
    }

    constructor(label : string, type : string, id : number = -1)
    {
        this.label = label;
        this.type = type;
        this.id = id;
    }

    public removeGate(gate : CircuitGate) : void
    {
        gate.gate.inputNodes.forEach((node : IONode) =>
        {
            node.inputNode && node.inputNode.disconnect(node);
        });

        gate.gate.outputNodes.forEach((node : IONode) =>
        {
            node.outputNodes.forEach((onode : IONode) =>
            {
                node.disconnect(onode);
            });
        });

        this.idPool.push(gate.id);

        this.gates.splice(this.gates.indexOf(gate), 1);
    }

    public addNode(node : IONode, isInput : boolean, id : number = -1) : CircuitNode
    {
        if (id === -1)
        {
            id = this.genId();
        }

        return new CircuitNode(this, node, isInput, id);
    }

    public removeNode(node : CircuitNode)
    {
        node.outputNodes.forEach(onode =>
        {
            node.node.disconnect(onode);
        });

        if (node.inputNode)
        {
            node.inputNode.disconnect(node.node);
        }

        let list = node.isInput ? this.inputNodes : this.outputNodes;

        list.splice(list.indexOf(node), 1);
    }

    private genId() : number
    {
        if (this.idPool.length > 0)
        {
            return this.idPool.splice(0 ,1)[0];
        }

        return this.idCounter++;
    }

    public serialize() : string
    {
        let ret = {
            label: this.label,
            type: this.type,
            innards: []
        };

        this.inputNodes.forEach(node => ret.innards.push(node.serialize()));
        this.outputNodes.forEach(node => ret.innards.push(node.serialize()));
        this.gates.forEach(gate => ret.innards.push(gate.serialize()));

        return JSON.stringify(ret);
    }

    public static parse(serialized : string) : Circuit
    {
        let s = JSON.parse(serialized);
        let ret = new Circuit(s.label, s.type);

        s.innards.forEach((o : SerializedObject)=>
        {
            if (o.type === "AND")
            {
                ret.addGate(new ANDGate(), o.id);
            }
            else if (o.type === "OR")
            {
                ret.addGate(new ORGate(), o.id);
            }
            else if (o.type === "XOR")
            {
                ret.addGate(new XORGate(), o.id);
            }
            else if (o.type === "inputNode")
            {
                let n = ret.addNode(new IONode(o.label), true, o.id); // add labels as an option
            }
            else
            {
                if (challenges[o.type] && challenges[o.type].solved)
                {
                    
                }
            }
        });

        return ret;
    }
}

export class CircuitGate
{
    public parent : Circuit;
    public gate : Gate;
    public id : number;
    public graphicsGate : GraphicsGate = null;

    constructor(parent : Circuit, gate : Gate, id : number = -1)
    {
        this.gate = gate;
        this.id = id;
        this.parent = parent;

        parent.gates.push(this);
    }

    public connect(outputIndex : number, gate : CircuitGate, inputIndex : number)
    {
        let srcNode = this.gate.outputNodes[outputIndex];
        let destNode = gate.gate.inputNodes[inputIndex];
        
        return {
            result: srcNode.connect(destNode),
            srcNode: srcNode,
            destNode: destNode
        };
    }

    public connectNode(outputIndex : number, node : CircuitNode)
    {
        let srcNode = this.outputNodes[outputIndex];
        let destNode = node.node;

        return {
            result: srcNode.connect(destNode),
            srcNode: srcNode,
            destNode: destNode
        };
    }

    public serialize() : SerializedObject
    {
        let ret = {
            type: this.gate.label,
            id: this.id,
            label: this.gate.label,
            outputConnections: []
        };

        this.gate.outputNodes.forEach((outputNode, oi) =>
        {
            outputNode.outputNodes.forEach((node, i) =>
            {
                let onode = this.parent.gateWithNode(node);
    
                let o =
                {
                    outputIndex: oi,
                    connectingToId: onode.id,
                    connectingToInputIndex: onode.gate.inputNodes.indexOf(node)
                };
    
                ret.outputConnections.push(o);
            });
        });
    }

    public get inputNodes() : IONode[]
    {
        return this.gate.inputNodes;
    }

    public get outputNodes() : IONode[]
    {
        return this.gate.outputNodes;
    }

    public get label() : string
    {
        return this.gate.label;
    }
}

export class CircuitNode
{
    public node : IONode;
    public isInput : boolean;
    public parent : Circuit;

    public id : number;
    public type : string;
    
    public graphicsNode : GraphicsNode = null;

    constructor(parent : Circuit, node : IONode, isInput : boolean, id : number = -1)
    {
        this.node = node;
        this.isInput = isInput;
        this.id = id;
        this.type = (isInput ? "input" : "output") + "Node";
        this.parent = parent;

        if (isInput)
        {
            this.parent.inputNodes.push(this);
        }
        else
        {
            this.parent.outputNodes.push(this);
        }
    }

    public get label() : string
    {
        return this.node.label;
    }

    public set label(label : string)
    {
        this.node.label = label;
    }

    public get inputNode() : IONode
    {
        return this.inputNode;
    }

    public get outputNodes() : IONode[]
    {
        return this.outputNodes;
    }

    public serialize() : SerializedObject
    {
        let ret = {
            type: this.type,
            id: this.id,
            label: this.label,
            outputConnections: []
        };

        this.node.outputNodes.forEach((node, i) =>
        {
            let onode = this.parent.builder.gateWithNode(node);

            let o =
            {
                outputIndex: 0,
                connectingToId: onode.id,
                connectingToInputIndex: onode.gate.inputNodes.indexOf(node)
            };

            ret.outputConnections.push(o);
        });

        return ret;
    }
}*/