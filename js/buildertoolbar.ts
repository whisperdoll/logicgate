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

        this.makeButton("arrow-left", "Back", this.buttonPress_exit);

        if (!sandbox)
        {
            this.makeButton("play", "Test", this.buttonPress_play);
        }
        else
        {
            this.makeButton("minus", "Input", this.buttonPress_removeInput);
            this.makeButton("plus", "Input", this.buttonPress_addInput);
            this.makeButton("minus", "Output", this.buttonPress_removeOutput);
            this.makeButton("plus", "Output", this.buttonPress_addOutput);
        }

        this.makeButton("save", "Save", this.buttonPress_save);
        this.makeButton("info", "Info", this.buttonPress_info);
        this.makeButton("table", "TrthTbl", this.buttonPress_truthTable);
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

        c.addEventListener("click", onclick.bind(this));

        this.container.appendChild(c);
    }

    public buttonPress_addInput()
    {
        let inputNo : number = this.parent.builder.circuit.numInputs + 1;
        this.parent.builder.addNode(
            "input" + inputNo.toString(),
            true
        );
    }

    public buttonPress_removeInput()
    {
        if (this.parent.builder.circuit.numInputs > 1)
        {
            this.parent.builder.removeLastInputNode();
        }
    }

    public buttonPress_addOutput()
    {
        let outputNo : number = this.parent.builder.circuit.numOutputs + 1;
        this.parent.builder.addNode(
            "output" + outputNo.toString(),
            false
        );
    }

    public buttonPress_removeOutput()
    {
        if (this.parent.builder.circuit.numOutputs > 1)
        {
            this.parent.builder.removeLastOutputNode();
        }
    }

    public buttonPress_play()
    { 
        this.parent.builder.test();
    }

    public buttonPress_exit()
    {
        this.parent.builder.exit();
    }

    public buttonPress_save()
    {
        this.parent.builder.save();
    }

    public buttonPress_info()
    {
        this.parent.builder.gateInfoWidget.show();
    }

    public buttonPress_truthTable()
    {
        this.parent.builder.truthTableWidget.show();
    }
}