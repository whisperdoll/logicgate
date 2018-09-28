import { Canvas } from "./canvas"
import { Gate } from "./gate"
import { pointInRect } from "./utils"
import { IONode } from "./ionode"

export class Builder
{
    public canvas : Canvas;
    public container : HTMLElement;
    public gates : GraphicsGate[] = [];
    public mouse : { x : number, y : number } = { x: 0, y: 0 };

    public movingGate : GraphicsGate;
    public movingOffset : { x : number, y : number };

    private connectingGate : GraphicsGate;
    private connectingOutput : number;

    public hovering : GraphicsGate;
    private parent : BuilderContainer;

    constructor(parent : BuilderContainer, width : number, height : number)
    {
        this.parent = parent;
        this.canvas = new Canvas({ width, height, align:
        {
            horizontal: true,
            vertical: true
        }});
        this.container = document.createElement("div");
        this.container.appendChild(this.canvas.canvas);

        this.canvas.mouse.addEventListener("move", this.mouseMove.bind(this));
        this.canvas.mouse.addEventListener("down", this.mouseDown.bind(this));
        this.canvas.mouse.addEventListener("up", this.mouseUp.bind(this));

        this.canvas.canvas.oncontextmenu = function(e)
        {
            e.preventDefault();
            return false;
        };

        this.container.className = "builder";

        parent.container.appendChild(this.container);
        
    }

    public get height() : number
    {
        return this.canvas.height;
    }

    public get width() : number
    {
        return this.canvas.width;
    }

    public gateWithNode(node : IONode) : GraphicsGate
    {
        return this.gates.find(gate => gate.gate.outputNodes.indexOf(node) !== -1 || gate.gate.inputNodes.indexOf(node) !== -1);
    }

    public draw() : void
    {
        this.canvas.clear();

        let padding = 32;
        this.canvas.fillRect(padding, padding,
            this.width - padding * 2, this.height - padding * 2, "rgba(255,255,255,1)");

        this.gates.forEach(gate => gate.draw(this.canvas));

        this.drawConnections();

        if (this.hovering)
        {
            //this.canvas.opacity = 0.75;
            this.hovering.draw(this.movingGate ? this.parent.overlay : this.canvas);
            //this.canvas.opacity = 1;
        }

        if (this.connectingGate)
        {
            let opt = this.connectingGate.nodePoint(this.connectingOutput, false, true);
            this.canvas.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, "red", 2);
        }
    }

    public drawConnections() : void
    {
        this.gates.forEach((gate : GraphicsGate) =>
        {
            gate.gate.outputNodes.forEach((node : IONode, i : number) =>
            {
                let opt = gate.nodePoint(i, false, true);
                
                node.outputNodes.forEach((inputNode : IONode, j : number) =>
                {
                    let gwn = this.gateWithNode(inputNode);
                    let ipt = gwn.nodePoint(gwn.gate.inputNodes.indexOf(inputNode), true, true);

                    this.canvas.drawLine(opt.x, opt.y, ipt.x, ipt.y, "red", 2);
                });
            });
        });
    }

    public addGate(gate : Gate) : GraphicsGate
    {
        let g = new GraphicsGate(gate);
        this.gates.push(g);
        return g;
    }

    public removeGate(gate : GraphicsGate) : void
    {
        gate.gate.inputNodes.forEach((node : IONode) =>
        {
            node.inputNode && node.inputNode.disconnect(node);
        });

        gate.gate.outputNodes.forEach((node : IONode) =>
        {
            node.outputNodes.forEach((onode : IONode) =>
            {
                node.disconnect(onode);
            });
        });

        this.gates.splice(this.gates.indexOf(gate), 1);
    }

    private mouseDown(x : number, y : number, e : MouseEvent) : void
    {
        e.preventDefault();

        let hoveredGate = this.hoveredGate();

        if (hoveredGate)
        {
            if (e.button === 0)
            {
                this.movingGate = hoveredGate;
                this.movingOffset = {
                    x: hoveredGate.x - this.mouse.x,
                    y: hoveredGate.y - this.mouse.y
                };

                this.parent.showOverlay();
            }
            else if (e.button === 2)
            {
                this.connectingGate = hoveredGate;
                this.connectingOutput = hoveredGate.getConnectingOutput(y);
            }
        }
    }

    public mouseMove(x : number, y : number, mouseDown : boolean, lx : number, ly : number, ox : number, oy : number, e : MouseEvent) : void
    {
        e.preventDefault();

        this.mouse.x = x;
        this.mouse.y = y;

        if (this.movingGate)
        {
            this.movingGate.x = x + this.movingOffset.x;
            this.movingGate.y = y + this.movingOffset.y;
        }
        else if (this.connectingGate)
        {
            let p1 = this.connectingGate.nodePoint(this.connectingOutput, false);
        }
        else
        {
            let hoveredGate = this.hoveredGate();
    
            if (hoveredGate)
            {
                this.canvas.canvas.style.cursor = "pointer";
                this.parent.overlay.canvas.style.cursor = "pointer";
            }
            else
            {
                this.canvas.canvas.style.cursor = "default";
                this.parent.overlay.canvas.style.cursor = "default";
            }
        }
    }

    public mouseUp(x : number, y : number, ox : number, oy : number, e : MouseEvent)
    {
        e.preventDefault();
        this.movingGate = null;

        if (this.connectingGate)
        {
            let h = this.hoveredGate();
            if (h && h !== this.connectingGate)
            {
                this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
            }
        }

        this.connectingGate = null;
    }

    private hoveredGate() : GraphicsGate
    {
        if (this.hovering)
        {
            this.hovering.hovered = false;
        }

        let gates = this.gates.filter(gate => gate.containsPoint(this.mouse.x, this.mouse.y));
        let ret = gates[gates.length - 1] || null;

        if (ret)
        {
            ret.hovered = true;
        }

        this.hovering = ret;

        return ret;
    }
}

export class GraphicsGate
{
    public x : number = 0;
    public y : number = 0;
    public width : number = 64;
    public height : number = 24;
    private color : string = "#fff";
    public gate : Gate;
    public nodeSize : number = 12;
    private nodePadding : number = 8;
    public hovered : boolean = false;

    constructor(gate : Gate)
    {
        this.gate = gate;
        let nodes = Math.max(gate.inputNodes.length, gate.outputNodes.length);
        this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
    }

    public draw(canvas : Canvas) : void
    {
        this.drawNodes(canvas, true);
        this.drawNodes(canvas, false);

        canvas.fillRect(this.x, this.y, this.width, this.height, this.color);
        canvas.drawRect(this.x, this.y, this.width, this.height, "black", 3, true);
        canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "black", "middle", "center", "24px monospace");
    }

    public drawNodes(canvas : Canvas, input : boolean) : void
    {
        let nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
        for (let i = 0; i < nodeList.length; i++)
        {
            let pt = this.nodePoint(i, input);
            let node = nodeList[i];

            canvas.drawRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                "black",
                1,
                true
            );

            if (this.hovered)
            {
                let fontSize = 14;
    
                canvas.fillText(
                    node.label,
                    pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2),
                    pt.y + this.nodeSize / 2,
                    "black",
                    "middle",
                    input ? "right" : "left",
                    fontSize + "px monospace"
                );
            }
        }
    }

    public nodePoint(index : number, input : boolean, corrected? : boolean) : { x : number, y : number }
    {
        if (corrected === undefined) corrected = false;
        
        let nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
        let padding = (this.height - nodeList.length * this.nodeSize) / (nodeList.length + 1);

        return {
            x: this.x - (corrected ? 0 : this.nodeSize / 2) + (input ? 0 : this.width),
            y: this.y + padding * (index + 1) + this.nodeSize * index + (corrected ? this.nodeSize / 2 : 0)
        };
    }

    public containsPoint(x : number, y : number) : boolean
    {
        return pointInRect(x, y, this.x - this.nodeSize, this.y, this.width + this.nodeSize * 2, this.height);
    }

    public nodeIndexFromY(y : number, input : boolean) : number
    {
        let slices = this.gate[input ? "inputNodes" : "outputNodes"].length;
        let localY = y - this.y;
        let h = this.height / slices;

        return ~~(localY / h);
    }

    public getConnectingOutput(y : number) : number
    {
        return this.nodeIndexFromY(y, false);
    }

    public getConnectingInput(y : number) : number
    {
        return this.nodeIndexFromY(y, true);
    }

    public connect(output : number, gate : GraphicsGate, input : number) : IONode
    {
        let inputNode = gate.gate.inputNodes[input];
        let o = this.gate.outputNodes[output].connect(inputNode);

        if (o.success)
        {
            return o.oustedNode;
        }
    }
}

export class GateList
{
    element : HTMLElement;
    parent : BuilderContainer;
    children : HTMLElement[] = [];

    constructor(parent : BuilderContainer)
    {
        this.element = document.createElement("div");
        this.element.className = "gateList";

        parent.container.appendChild(this.element);
        this.parent = parent;
    }

    private createGateElement(gateClass : typeof Gate) : HTMLElement
    {
        let g = new GraphicsGate(<Gate>(new gateClass()));
        let c = new Canvas({ width: g.width + g.nodeSize * 2, height: g.height + 8 });
        g.x = g.nodeSize;
        g.y = 4;
        g.draw(c);

        let container = document.createElement("div");
        container.className = "gate";
        container.appendChild(c.canvas);

        c.mouse.addEventListener("down", (x : number, y : number, e : MouseEvent) =>
        {
            this.spawnGate(<Gate>(new gateClass()), x, y, e);
        });
        
        return container;
    }

    private appendChild(element : HTMLElement)
    {
        this.element.appendChild(element);
        this.children.push(element);
    }

    public appendGateElement(gateClass : typeof Gate) : void
    {
        this.appendChild(this.createGateElement(gateClass));
    }

    private spawnGate(gate : Gate, x : number, y : number, e : MouseEvent)
    {
        let g = this.parent.builder.addGate(gate);
        this.parent.builder.hovering = g;
        this.parent.builder.movingGate = g;
        this.parent.builder.movingOffset = { x: -g.width / 2, y: -g.height / 2 };
        g.x = this.element.getBoundingClientRect().left + this.children[0].getBoundingClientRect().left;
        this.parent.showOverlay();
    }
}

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
    }
}

export class BuilderContainer
{
    public container : HTMLElement;
    public builder : Builder;
    public gateList : GateList;
    public toolbar : Toolbar;
    public overlay : Canvas;

    constructor(parent : HTMLElement, resX : number, resY : number)
    {
        this.container = document.createElement("div");
        this.container.className = "container-builder";
        this.builder = new Builder(this, resX, resY);
        this.gateList = new GateList(this);
        this.toolbar = new Toolbar(this);

        this.overlay = new Canvas({ width: resX * (10/9), height: resY });
        this.overlay.canvas.className = "overlay";

        this.container.appendChild(this.overlay.canvas);

        this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
        this.overlay.mouse.addEventListener("up", this.mouseUp.bind(this));

        parent.appendChild(this.container);
        this.hideOverlay();
        window.requestAnimationFrame(this.drawReq.bind(this));
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
        
        if (x > this.overlay.width * 0.9)
        {
            this.builder.removeGate(gate);
        }

        this.hideOverlay();
    }

    public mouseMove(x : number, y : number, mouseDown : boolean, lx : number, ly : number, ox : number, oy : number, e : MouseEvent) : void
    {
        this.builder.mouseMove.call(this.builder, x, y, mouseDown, lx, ly, ox, oy, e);
    }

    public draw()
    {
        this.overlay.clear();

        if (this.builder.movingGate)
        {
            if (this.builder.mouse.x > this.overlay.width * 0.9)
            {
                this.overlay.fillRect(this.overlay.width * 0.9, 0, this.overlay.width * 0.1, this.overlay.height, "rgba(255,0,0,0.3)");
            }
        }

        this.builder.draw();
    }

    private drawReq() : void
    {
        this.draw();
        window.requestAnimationFrame(this.drawReq.bind(this));
    }
}