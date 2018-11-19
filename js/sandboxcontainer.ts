import { UI } from "./ui";

export class SandboxContainer
{
    public container : HTMLElement;
    public headerContainer : HTMLElement;
    public gateContainer : HTMLElement;
    public parent : UI;

    constructor(parent : UI)
    {
        this.parent = parent;

        this.container = document.createElement("div");
        this.container.className = "container-sandbox";

        this.gateContainer = document.createElement("div");
        this.gateContainer.className = "container-sandbox-gates";

        this.headerContainer = document.createElement("div");
        this.headerContainer.className = "container-sandbox-header";

        let s = document.createElement("div");
        s.className = "sandbox-title";
        s.innerText = "Sandbox";

        this.headerContainer.appendChild(s);

        this.parent.container.appendChild(this.container);
        this.container.appendChild(this.headerContainer);
        this.container.appendChild(this.gateContainer);
    }

    public build()
    {
        
    }
}