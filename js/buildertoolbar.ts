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

        this.makeButton("img/back.png", "Back", () =>
        {
            this.parent.builder.exit();
        });

        if (!sandbox)
        {
            this.makeButton("img/play.png", "Test", ()=>
            {
                this.parent.builder.test();
            });
        }
        else
        {
            this.makeButton("img/minus.png", "Input", () =>
            {
                this.parent.builder.removeLastInputNode();
            });
            this.makeButton("img/plus.png", "Input", () =>
            {
                let inputNo : number = this.parent.builder.circuit.numInputs + 1;
                this.parent.builder.addNode(
                    "input" + inputNo.toString(),
                    true
                );
            });

            this.makeButton("img/minus.png", "Output", () =>
            {
                this.parent.builder.removeLastOutputNode();
            });
            this.makeButton("img/plus.png", "Output", () =>
            {
                let outputNo : number = this.parent.builder.circuit.numOutputs + 1;
                this.parent.builder.addNode(
                    "output" + outputNo.toString(),
                    false
                );
            });
        }

        this.makeButton("img/save.png", "Save", () =>
        {
            this.parent.builder.save();
        });

        this.makeButton("img/info.png", "Info", () =>
        {
            this.parent.builder.gateInfoWidget.show();
        });

        this.makeButton("img/truthtable.png", "TrthTbl", () =>
        {
            this.parent.builder.truthTableWidget.show();
        });
    }

    public makeButton(imgSrc, text, onclick) : void
    {
        let c = document.createElement("div");
        c.className = "toolbar-button";
        
        let i = document.createElement("img");
        i.src = imgSrc;
        c.appendChild(i);

        let l = document.createElement("div");
        l.innerText = text;
        c.appendChild(l);

        c.addEventListener("click", onclick);

        this.container.appendChild(c);
    }
}