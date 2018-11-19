import { createElement } from "./utils";
import { UI } from "./ui";

export class Landing
{
    public container : HTMLElement;
    public parent : UI;

    constructor(parent : UI)
    {
        this.parent = parent;
        this.container = createElement("div", "container-landing");

        let header = createElement("h1", "landing-header");
        header.innerText = "logic;gate";
        this.container.appendChild(header);

        let sandboxBtn = createElement("button", "landing-button");
        sandboxBtn.innerText = "sandbox";
        sandboxBtn.addEventListener("click", () =>
        {
            this.parent.show(UI.SANDBOX);
        });
        this.container.appendChild(sandboxBtn);

        let challengesBtn = createElement("button", "landing-button");
        challengesBtn.innerText = "challenges";
        challengesBtn.addEventListener("click", () =>
        {
            this.parent.show(UI.CHALLENGES);
        });
        this.container.appendChild(challengesBtn);

        this.parent.container.appendChild(this.container);
    }
}