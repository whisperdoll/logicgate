import { BuilderContainer } from "./buildercontainer";
import { ZeroGate, OneGate, NOTGate, ANDGate, ORGate, CircuitGate } from "./gate";
import challenges from "./challenges";
import { Canvas } from "./canvas";
import { GraphicsGate } from "./graphicsgate";


export class GateList
{
    element : HTMLElement;
    parent : BuilderContainer;
    children : HTMLElement[] = [];

    constructor(parent : BuilderContainer)
    {
        this.element = document.createElement("div");
        this.element.className = "gateList";

        parent.container.appendChild(this.element);
        this.parent = parent;
    }

    public build(circuitType : string)
    {
        this.element.innerHTML = "";
        this.children = [];

        this.appendGateElement(new ZeroGate());
        this.appendGateElement(new OneGate());
        this.appendGateElement(new NOTGate());
        this.appendGateElement(new ANDGate());
        this.appendGateElement(new ORGate());

        for (let type in challenges)
        {
            let c = challenges[type];
        
            // let's prevent circuits from containing eachother //    
            let t = CircuitGate.ofType(c.type);
            let forbid = t.gateTypesUsed;

            if (c.solved && c.type !== circuitType && !forbid.has(circuitType))
            {
                this.appendGateElement(t);
            }
        }
    }

    private createGateElement(gate : CircuitGate) : HTMLElement
    {
        let g = new GraphicsGate(this.parent, gate.clone());
        let e = g.toHTMLElement();
        let c = e.firstElementChild;

        new Canvas({ canvasElement: c }).mouse.addEventListener("down", (x : number, y : number, e : MouseEvent) =>
        {
            this.spawnGate(gate.clone(), x, y, e);
        });
        
        return e;
    }

    private appendChild(element : HTMLElement)
    {
        this.element.appendChild(element);
        this.children.push(element);
    }

    public appendGateElement(gate : CircuitGate) : void
    {
        this.appendChild(this.createGateElement(gate));
    }

    private spawnGate(gate : CircuitGate, x : number, y : number, e : MouseEvent)
    {
        let g = this.parent.builder.addGate(gate.clone());
        this.parent.builder.hovering = g;
        this.parent.builder.movingGate = g;
        this.parent.builder.movingOffset = { x: -g.width / 2, y: -g.height / 2 };
        g.x = this.element.getBoundingClientRect().left + this.children[0].getBoundingClientRect().left;
        this.parent.showOverlay();
    }
}