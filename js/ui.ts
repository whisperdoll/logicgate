import { BuilderContainer, GraphicsGate } from "./builder";
import { Gate, OpGate, ShallowGate, loadCircuits, CircuitGate } from "./gate";
import { hideElement, showElement } from "./utils";
import challenges, { ChallengeObject } from "./challenges";

export class UI
{
    public container : HTMLElement;
    public parent : HTMLElement;
    public builderContainer : BuilderContainer;
    public challengeContainer : ChallengeContainer;

    public static BUILDER : number = 0;
    public static CHALLENGES : number = 1;

    constructor(parent : HTMLElement, resX : number, resY : number)
    {
        this.parent = parent;
        this.container = document.createElement("div");
        this.container.className = "container-ui";

        this.builderContainer = new BuilderContainer(this, resX, resY);
        this.challengeContainer = new ChallengeContainer(this);


        this.parent.appendChild(this.container);

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        loadCircuits();
        this.show(UI.CHALLENGES); // builds it too
    }

    public show(what : number) : void
    {
        this.hideAll();

        switch (what)
        {
            case UI.BUILDER:
                showElement(this.builderContainer.container);
                break;
            case UI.CHALLENGES:
                this.challengeContainer.build();
                showElement(this.challengeContainer.container);
                break;
        }
    }

    public hideAll() : void
    {
        hideElement(this.builderContainer.container);
        hideElement(this.challengeContainer.container);
    }

    public get size() : { width : number, height : number }
    {
        let c = this.container.getBoundingClientRect();
        return { width: c.width, height: c.height };
    }

    public get innerSize() : { width : number, height : number }
    {
        return { width: this.container.offsetWidth, height: this.container.offsetHeight };
    }

    public resize() : void
    {
        let psize = this.parent.getBoundingClientRect();
        let w = psize.width;
        let h = psize.height;

        let size = this.innerSize;
        let scaleX = w / size.width;
        let scaleY = h / size.height;

        this.container.style.transform = "scale(" + scaleX + "," + scaleY + ")";
        //this.overlay.canvas.style.transform = this.container.style.transform;
    }
}

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
        s.innerText = "logic;gate";

        this.headerContainer.appendChild(s);

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
            this.parent.builderContainer.editGate(CircuitGate.ofType(challenge.type));
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