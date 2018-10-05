import { BuilderContainer } from "./builder";

export class UI
{
    public container : HTMLElement;
    public parent : HTMLElement;
    public builderContainer : BuilderContainer;

    constructor(parent : HTMLElement, resX : number, resY : number)
    {
        this.parent = parent;

        this.container = document.createElement("div");
        this.parent.appendChild(this.container);

        this.builderContainer = new BuilderContainer(this, resX, resY);
    }
}