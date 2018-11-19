import challenges, { ChallengeObject } from "./challenges";
import { GraphicsGate } from "./graphicsgate";
import { ShallowGate, CircuitGate } from "./gate";
import { UI } from "./ui";

export class ChallengeContainer
{
    public container : HTMLElement;
    public headerContainer : HTMLElement;
    public gateContainer : HTMLElement;
    public parent : UI;

    constructor(parent : UI)
    {
        this.parent = parent;

        this.container = document.createElement("div");
        this.container.className = "container-challenges";

        this.gateContainer = document.createElement("div");
        this.gateContainer.className = "container-challenges-gates";

        this.headerContainer = document.createElement("div");
        this.headerContainer.className = "container-challenges-header";

        let s = document.createElement("div");
        s.className = "challenges-title";
        s.innerText = "Challenges";
        this.headerContainer.appendChild(s);

        let b = document.createElement("i");
        b.className = "challenges-back fas fa-arrow-left";
        b.innerHTML = "<span>&nbsp;&nbsp;Back</span>";
        b.addEventListener("click", () => this.parent.show(UI.LANDING));
        this.headerContainer.appendChild(b);

        this.parent.container.appendChild(this.container);
        this.container.appendChild(this.headerContainer);
        this.container.appendChild(this.gateContainer);
    }

    public addChallenge(challenge : ChallengeObject)
    {
        let g = new GraphicsGate(this.parent.builderContainer,
            new ShallowGate(challenge.label, challenge.inputs.length, challenge.outputs.length));

        if (challenge.solved)
        {
            g.color = "#CCFFCC";
        }
        else
        {
            g.color = "#FFCCCC";
        }

        let e = g.toHTMLElement();
        e.addEventListener("click", () =>
        {
            this.parent.builderContainer.loadGate(CircuitGate.ofType(challenge.type));
            this.parent.show(UI.BUILDER);
        });

        this.gateContainer.appendChild(e);
    }

    public build()
    {
        this.gateContainer.innerHTML = "";

        for (let type in challenges)
        {
            this.addChallenge(challenges[type]);
        }
    }
}