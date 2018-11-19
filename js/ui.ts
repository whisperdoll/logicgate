import { loadCircuits, CircuitGate } from "./gate";
import { hideElement, showElement } from "./utils";
import { BuilderContainer } from "./buildercontainer";
import { SandboxContainer } from "./sandboxcontainer";
import { ChallengeContainer } from "./challengecontainer";
import { Landing } from "./landing";

export class UI
{
    public container : HTMLElement;
    public parent : HTMLElement;
    public builderContainer : BuilderContainer;
    public challengeContainer : ChallengeContainer;
    public sandboxContainer : SandboxContainer;
    public landing : Landing;

    public static readonly LANDING : number = 0;
    public static readonly BUILDER : number = 1;
    public static readonly CHALLENGES : number = 2;
    public static readonly SANDBOX : number = 3;

    constructor(parent : HTMLElement, resX : number, resY : number)
    {
        this.parent = parent;
        this.container = document.createElement("div");
        this.container.className = "container-ui";

        this.builderContainer = new BuilderContainer(this, resX, resY);
        this.challengeContainer = new ChallengeContainer(this);
        this.landing = new Landing(this);

        this.parent.appendChild(this.container);

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        loadCircuits();
        this.show(UI.LANDING); // builds it too
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
            case UI.SANDBOX:
            {
                let g = new CircuitGate("sandbox", "sandbox");
                this.builderContainer.loadGate(g);
                showElement(this.builderContainer.container);
                break;
            }
            case UI.LANDING:
                showElement(this.landing.container);
                break;
        }
    }

    public hideAll() : void
    {
        hideElement(this.builderContainer.container);
        hideElement(this.challengeContainer.container);
        hideElement(this.landing.container);
        //hideElement(this.sandboxContainer.container);
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