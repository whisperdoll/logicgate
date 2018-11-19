import { BuilderContainer } from "./buildercontainer";


export class Toolbar
{
    public container : HTMLElement;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer, sandbox : boolean = true)
    {
        this.container = document.createElement("div");
        this.container.className = "toolbar";
        this.parent = parent;
        parent.container.appendChild(this.container);

        this.makeButton("arrow-left", "Back", () =>
        {
            this.parent.builder.exit();
        });

        if (!sandbox)
        {
            this.makeButton("play", "Test", ()=>
            {
                this.parent.builder.test();
            });
        }
        else
        {
            this.makeButton("minus", "Input", () =>
            {
                this.parent.builder.removeLastInputNode();
            });
            this.makeButton("plus", "Input", () =>
            {
                let inputNo : number = this.parent.builder.circuit.numInputs + 1;
                this.parent.builder.addNode(
                    "input" + inputNo.toString(),
                    true
                );
            });

            this.makeButton("minus", "Output", () =>
            {
                this.parent.builder.removeLastOutputNode();
            });
            this.makeButton("plus", "Output", () =>
            {
                let outputNo : number = this.parent.builder.circuit.numOutputs + 1;
                this.parent.builder.addNode(
                    "output" + outputNo.toString(),
                    false
                );
            });
        }

        this.makeButton("save", "Save", () =>
        {
            this.parent.builder.save();
        });

        this.makeButton("info", "Info", () =>
        {
            this.parent.builder.gateInfoWidget.show();
        });

        this.makeButton("table", "TrthTbl", () =>
        {
            this.parent.builder.truthTableWidget.show();
        });
    }

    public makeButton(icon, text, onclick) : void
    {
        let c = document.createElement("div");
        c.className = "toolbar-button";
        
        let i = document.createElement("i");
        i.className = "fas fa-" + icon;
        c.appendChild(i);

        let l = document.createElement("div");
        l.innerText = text;
        c.appendChild(l);

        c.addEventListener("click", onclick);

        this.container.appendChild(c);
    }
}