import { BuilderContainer } from "./buildercontainer";


export class Toolbar
{
    public container : HTMLElement;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer)
    {
        this.container = document.createElement("div");
        this.container.className = "toolbar";
        this.parent = parent;
        parent.container.appendChild(this.container);

        this.makeButton("img/back.png", "Back", () =>
        {
            this.parent.builder.exit();
        });

        this.makeButton("img/play.png", "Test", ()=>
        {
            this.parent.builder.test();
        });

        this.makeButton("img/save.png", "Save", () =>
        {
            this.parent.builder.save();
        });

        this.makeButton("img/info.png", "Info", () =>
        {
            this.parent.builder.gateInfoWidget.show();
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