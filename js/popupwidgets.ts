import challenges, { ChallengeExpectation } from "./challenges";
import { cloneJSON, showElement, hideElement } from "./utils";
import { Builder } from "./builder";
import { IONode } from "./ionode";
import { Canvas } from "./canvas";
import { CircuitGate } from "./gate";
import { GraphicsGate } from "./graphicsgate";

export class PopupWidget
{
    public parent : Builder;
    public container : HTMLElement;
    public innerContainer : HTMLElement;
    public okButton : HTMLElement;

    constructor(parent : Builder)
    {
        this.parent = parent;

        this.container = document.createElement("div");
        this.container.className = "popup";
        this.container.onclick = this.hide.bind(this);

        this.innerContainer = document.createElement("div");
        this.innerContainer.className = "inner";
        this.innerContainer.onclick = e => e.stopPropagation();
        this.container.appendChild(this.innerContainer);

        this.okButton = document.createElement("button");
        this.okButton.className = "close";
        this.okButton.innerText = "OK";
        this.okButton.onclick = this.hide.bind(this);
        this.innerContainer.appendChild(this.okButton);

        this.parent.parent.container.appendChild(this.container);
        this.hide();
    }

    public hide() : void
    {
        hideElement(this.container);
    }

    public show() : void
    {
        showElement(this.container);
    }
}

export class PopupMessage extends PopupWidget
{
    constructor(parent : Builder, title : string, message : string)
    {
        super(parent);
        this.container.classList.add("popupMessage");

        let $title = document.createElement("h1");
        $title.innerText = title;
        $title.className = "title";
        this.innerContainer.appendChild($title);

        let $message = document.createElement("div");
        $message.innerText = message;
        $message.className = "message";
        this.innerContainer.appendChild($message);
    }
}

export class PopupYesNo extends PopupMessage
{
    constructor(parent : Builder, title : string, message : string,
        onyes : Function, onno : Function)
    {
        super(parent, title, message);
        this.container.classList.add("popupYesNo");

        let n = <HTMLElement>this.okButton.cloneNode();
        n.onclick = this.okButton.onclick;

        let c = <HTMLElement>this.okButton.cloneNode();
        c.onclick = this.okButton.onclick;

        this.okButton.innerText = "Yes";
        this.okButton.classList.add("yes");
        this.okButton.addEventListener("click", () => onyes());

        n.innerText = "No";
        n.addEventListener("click", () => onno());
        n.classList.add("no");
        this.innerContainer.appendChild(n);

        c.innerText = "Cancel";
        c.classList.add("cancel");
        this.innerContainer.appendChild(c);
    }
}

export class GatePanelWidget extends PopupWidget
{
    public panelContainer : HTMLElement;
    public descriptionContainer : HTMLElement;

    constructor(parent : Builder)
    {
        super(parent);
        this.container.classList.add("gatePanelWidget");

        this.descriptionContainer = document.createElement("div");
        this.descriptionContainer.className = "description";
        this.innerContainer.appendChild(this.descriptionContainer);

        this.panelContainer = document.createElement("div");
        this.panelContainer.className = "panelList";
        this.innerContainer.appendChild(this.panelContainer);
    }

    public addPanel(e : ChallengeExpectation)
    {
        this.panelContainer.appendChild(this.makePanel(this.parent.circuit, e.inputs, e.outputs));
    }

    private makePanel(gate : CircuitGate, inputs? : number[], outputs? : number[]) : HTMLElement
    {
        gate = gate.clone();
        
        if (inputs)
        {
            gate.forEachInput((node : IONode, i : number) => node.value = inputs[i]);
        }
        
        if (outputs)
        {
            gate.forEachOutput((node : IONode, i : number) => node.value = outputs[i]);
        }
        
        let gg = gate.graphicsGate || new GraphicsGate(this.parent.parent, gate);
        let c = new Canvas({ width: gg.width * 4, height: gg.height});
        gg.y = 0;
        gg.x = gg.width * 1.5;

        gg.drawGate(c);
        gg.drawNodes(c, true, true);
        gg.drawNodes(c, false, true);

        let ret = document.createElement("div");
        ret.className = "panel";
        ret.appendChild(c.canvas);

        return ret;
    }
}

export class GateInfoWidget extends GatePanelWidget
{
    constructor(parent : Builder)
    {
        super(parent);

        let c = challenges[this.parent.circuit.type];
        this.descriptionContainer.innerHTML = c.description;

        c.expects.forEach((e, i) =>
        {
            this.addPanel(e);
        });

        //hideElement(this.container);
    }
}

export class GateErrorWidget extends GatePanelWidget
{
    constructor(parent : Builder)
    {
        super(parent);

        this.container.classList.add("gateErrorWidget");
        this.descriptionContainer.innerText = "There were some errors...";

        /// doo it
    }

    public clear()
    {
        this.panelContainer.innerHTML = "";
    }

    // todo: test before exiting if other nodes use it ?

    public addError(e : ChallengeExpectation, given : number[])
    {
        let t = this.parent.circuit.type;
        let c = challenges[t];

        this.addLabel("Expected:");
        this.addPanel(e);

        e = cloneJSON(e);
        e.outputs = given;

        this.addLabel("Given:");
        this.addPanel(e);

        this.panelContainer.appendChild(document.createElement("hr"));
    }

    private addLabel(str : string) : void
    {
        let label = document.createElement("div");
        label.className = "label";
        label.innerText = str;
        this.panelContainer.appendChild(label);
    }
}