import { UI } from "./ui";
import { Builder } from "./builder";
import { Canvas } from "./canvas";
import { CircuitGate } from "./gate";
import { GateList } from "./buildergatelist";
import { Toolbar } from "./buildertoolbar";


export class BuilderContainer
{
    public container : HTMLElement;
    public parent : UI;
    public builder : Builder;
    public gateList : GateList;
    public toolbar : Toolbar;
    public overlay : Canvas;
    
    public resX : number;
    public resY : number;

    constructor(parent : UI, resX : number, resY : number)
    {
        this.parent = parent;
        this.container = document.createElement("div");
        this.container.className = "container-builder";
        this.builder = null;
        this.gateList = new GateList(this);
        this.toolbar = new Toolbar(this);

        this.resX = resX;
        this.resY = resY;

        this.overlay = new Canvas({ width: resX * (100/(100-15)), height: resY });
        this.overlay.canvas.className = "overlay";

        this.container.appendChild(this.overlay.canvas);

        this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
        this.overlay.mouse.addEventListener("up", this.mouseUp.bind(this));

        parent.container.appendChild(this.container);
        this.hideOverlay();
        window.requestAnimationFrame(this.drawReq.bind(this));

        this.parent.container.appendChild(this.container);
    }

    public editGate(gate : CircuitGate) : void
    {
        //this.builder && this.builder.die();

        this.builder = new Builder(this, gate.clone(), this.resX, this.resY);
    }

    public showOverlay() : void
    {
        this.overlay.canvas.style["z-index"] = 1;
    }

    public hideOverlay() : void
    {
        this.overlay.canvas.style["z-index"] = -1;
    }

    public mouseUp(x : number, y : number, ox : number, oy : number, e : MouseEvent)
    {
        let gate = this.builder.movingGate;

        this.builder.mouseUp.call(this.builder, x, y, ox, oy, e);
        
        if (x > this.overlay.width * (1 - 0.15))
        {
            this.builder.removeGate(gate);
        }

        if (y > this.resY)
        {
            gate.y = this.resY - gate.height;
        }

        this.hideOverlay();
    }

    public mouseMove(x : number, y : number, mouseDown : boolean, lx : number, ly : number, ox : number, oy : number, e : MouseEvent) : void
    {
        this.builder.mouseMove.call(this.builder, x, y, mouseDown, lx, ly, ox, oy, e);
    }

    public draw()
    {
        if (!this.builder) return;

        this.overlay.clear();

        if (this.builder.movingGate)
        {
            if (this.builder.mouse.x > this.overlay.width * (1 - 0.15))
            {
                this.overlay.fillRect(this.overlay.width * (1 - 0.15), 0, this.overlay.width * 0.15, this.overlay.height, "rgba(255,0,0,0.3)");
            }
        }

        this.builder.draw();
    }

    private drawReq() : void
    {
        this.draw();
        window.requestAnimationFrame(this.drawReq.bind(this));
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
}