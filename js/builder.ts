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

    public inputNodes : GraphicsNode[] = [];
    public outputNodes : GraphicsNode[] = [];

    public movingGate : GraphicsGate;
    public movingOffset : { x : number, y : number };

    private connectingGate : GraphicsGate;
    private connectingOutput : number;

    private connectingNode : GraphicsNode;

    public hovering : GraphicsGate;
    private parent : BuilderContainer;

    public padding : number = 32;

    public static Colors : string[] = [
        "#e6194B",
        "#3cb44b",
        "#ffe119",
        "#1111d8",
        "#ff5000",
        "#911eb4",
        "#00ffc7",
        "#42d4f4",
        "#f032e6",
        "#0061ff",
        "#469990",
        "#9A6324",
        "#fffac8",
        "#800000",
        "#aaffc3",
        "#536336",
        "#808000",
        "#3c545b",
        "#000075",
        "#000000"
    ];

    public static ColorIndex : number = 0;

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

    public addInputNode(label : string)
    {
        this.inputNodes.push(new GraphicsNode(new IONode(label), true));
        this.organizeNodes();
    }

    public addOutputNode(label : string)
    {
        this.outputNodes.push(new GraphicsNode(new IONode(label), false));
        this.organizeNodes();
    }

    public organizeNodes()
    {
        let workingHeight = this.height - this.padding * 2;
        let workingWidth = this.width - this.padding * 2;

        let padding = 16;

        this.inputNodes.forEach((node : GraphicsNode, i : number) =>
        {
            node.x = this.padding + padding;
            node.cy = this.padding + (workingHeight / (this.inputNodes.length + 1)) * (i + 1);
        });

        this.outputNodes.forEach((node : GraphicsNode, i : number) =>
        {
            node.x = this.padding + workingWidth - padding - node.size;
            node.cy = this.padding + (workingHeight / (this.outputNodes.length + 1)) * (i + 1);
        });
    }

    public gateWithNode(node : IONode) : GraphicsGate
    {
        return this.gates.find(gate => gate.gate.outputNodes.indexOf(node) !== -1 || gate.gate.inputNodes.indexOf(node) !== -1);
    }

    public draw() : void
    {
        this.canvas.clear();

        this.canvas.fill("rgba(0,0,0,0.5)");
        this.canvas.fillRoundedRect(this.padding, this.padding,
            this.width - this.padding * 2, this.height - this.padding * 2, 20, "rgba(255,255,255,0.5)");

        this.inputNodes.forEach(node => node.draw(this.canvas));
        this.outputNodes.forEach(node => node.draw(this.canvas));

        this.gates.forEach(gate => gate.drawGate(this.canvas));
        this.gates.forEach(gate => gate.drawNodes(this.canvas, false));
        this.gates.forEach(gate => gate.drawNodes(this.canvas, true));

        this.drawConnections();

        if (this.hovering)
        {
            //this.canvas.opacity = 0.75;
            this.hovering.drawGate(this.movingGate ? this.parent.overlay : this.canvas);
            this.hovering.drawNodes(this.movingGate ? this.parent.overlay : this.canvas, true);
            this.hovering.drawNodes(this.movingGate ? this.parent.overlay : this.canvas, false);
            //this.canvas.opacity = 1;
        }

        if (this.connectingGate)
        {
            let opt = this.connectingGate.nodePoint(this.connectingOutput, false, true);
            this.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, this.connectingGate.colorIndex);
        }
        else if (this.connectingNode)
        {
            this.drawLine(this.connectingNode.cx, this.connectingNode.cy, this.mouse.x, this.mouse.y, this.connectingNode.colorIndex);
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
                    let ipt = this.nodePoint(inputNode);
                    this.drawLine(opt.x, opt.y, ipt.x, ipt.y, gate.colorIndex);
                });
            });
        });

        this.inputNodes.forEach((node : GraphicsNode) =>
        {
            node.node.outputNodes.forEach((inputNode : IONode, i : number) =>
            {
                let ipt = this.nodePoint(inputNode);
                this.drawLine(node.cx, node.cy, ipt.x, ipt.y, node.colorIndex);
            });
        });
    }

    public nodePoint(node : IONode) : { x : number, y : number }
    {
        let match;
        
        if (match = this.inputNodes.find(n => n.node === node) || this.outputNodes.find(n => n.node === node))
        {
            return { x: match.cx, y: match.cy };
        }
        else if (match = this.gateWithNode(node))
        {
            return match.nodePoint(match.gate.inputNodes.indexOf(node), true, true);
        }
        else
        {
            throw "cant find the node ://";
            //return null;
        }
    }

    public drawLine(x1, y1, x2, y2, colorIndex)
    {
        this.canvas.drawLine(x1, y1, x2, y2, Builder.Colors[colorIndex], 2);
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
        let n;

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
        else if (n = this.inputNodes.find(node => node.containsPoint(x, y)))
        {
            this.connectingNode = n;
        }
    }

    public mouseMove(x : number, y : number, mouseDown : boolean, lx : number, ly : number, ox : number, oy : number, e : MouseEvent) : void
    {
        e.preventDefault();
        //console.log(x, y);

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
        else if (this.connectingNode)
        {

        }
        else
        {
            let hoveredGate = this.hoveredGate();
    
            if (hoveredGate || this.inputNodes.some(node => node.containsPoint(x, y)) || this.outputNodes.some(node => node.containsPoint(x, y)))
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

        let n = null;

        if (this.connectingGate)
        {
            let h = this.hoveredGate();
            if (h && h !== this.connectingGate)
            {
                this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
            }
            else if (n = this.outputNodes.find(node => node.containsPoint(x, y)))
            {
                this.connectingGate.connectNode(this.connectingOutput, n);
            }
        }
        else if (this.connectingNode)
        {
            let h = this.hoveredGate();
            if (h)
            {
                this.connectingNode.node.connect(h.gate.inputNodes[h.getConnectingInput(y)]);
            }
            else if (n = this.outputNodes.find(node => node.containsPoint(x, y)))
            {
                this.connectingNode.node.connect(n.node);
            }
        }

        this.connectingGate = null;
        this.connectingNode = null;
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

export class GraphicsNode
{
    public x : number = 0;
    public y : number = 0;
    public size : number = 32;
    public node : IONode;
    public input : boolean;
    public colorIndex : number;

    constructor(node : IONode, isInput : boolean)
    {
        this.node = node;
        this.input = isInput;
        this.colorIndex = Builder.ColorIndex++;
    }

    public draw(canvas : Canvas) : void
    {
        canvas.fillCircleInSquare(this.x, this.y, this.size, "white");
        canvas.drawCircleInSquare(this.x, this.y, this.size, "black", 2);
    }

    public get cx() : number
    {
        return this.x + this.size / 2;
    }

    public get cy() : number
    {
        return this.y + this.size / 2;
    }

    public set cx(cx : number)
    {
        this.x = cx - this.size / 2;
    }

    public set cy(cy : number)
    {
        this.y = cy - this.size / 2;
    }

    public containsPoint(x : number, y : number) : boolean
    {
        return pointInRect(x, y, this.x, this.y, this.size, this.size);
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
    public colorIndex : number;

    constructor(gate : Gate)
    {
        this.gate = gate;
        let nodes = Math.max(gate.inputNodes.length, gate.outputNodes.length);
        this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
        this.colorIndex = Builder.ColorIndex++;
    }

    public drawGate(canvas : Canvas) : void
    {
        //this.drawNodes(canvas, true);
        //this.drawNodes(canvas, false);

        canvas.fillRoundedRect(this.x, this.y, this.width, this.height, 5, this.color, false);
        canvas.drawRoundedRect(this.x, this.y, this.width, this.height, 5, "black", 2, false);
        canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "black", "middle", "center", "24px monospace");
    }

    public drawNodes(canvas : Canvas, input : boolean) : void
    {
        let nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
        for (let i = 0; i < nodeList.length; i++)
        {
            let pt = this.nodePoint(i, input);
            let node = nodeList[i];

            canvas.fillRoundedRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                5,
                this.color,
                false
            );

            canvas.drawRoundedRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                3,
                "black",
                2,
                false
            );

            if (this.hovered)
            {
                let fontSize = 14;
                let fontSize2 = fontSize + 2;
    
                canvas.fillText(
                    node.label,
                    pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2),
                    pt.y + this.nodeSize / 2,
                    "white",
                    "middle",
                    input ? "right" : "left",
                    fontSize + "px monospace"
                );
    
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
        let srcNode = this.gate.outputNodes[output];
        let inputNode = gate.gate.inputNodes[input];
        let o = srcNode.connect(inputNode);

        if (o.success)
        {
            return o.oustedNode;
        }
        else
        {
            srcNode.disconnect(inputNode);
            return null;
        }
    }

    public connectNode(output : number, node : GraphicsNode) : IONode
    {
        let srcNode = this.gate.outputNodes[output];
        let inputNode = node.node;
        let o = srcNode.connect(inputNode);

        if (o.success)
        {
            return o.oustedNode;
        }
        else
        {
            srcNode.disconnect(inputNode);
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
        g.drawGate(c);
        g.drawNodes(c, true);
        g.drawNodes(c, false);

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

        this.makeButton("img/play.png", "Run", ()=>{});
        this.makeButton("img/step.png", "Step", ()=>{});
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

export class BuilderContainer
{
    public container : HTMLElement;
    public parent : HTMLElement;
    public builder : Builder;
    public gateList : GateList;
    public toolbar : Toolbar;
    public overlay : Canvas;

    constructor(parent : HTMLElement, resX : number, resY : number)
    {
        this.parent = parent;
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

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
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