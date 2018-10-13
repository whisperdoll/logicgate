import { Canvas } from "./canvas"
import { Gate, ANDGate, ORGate, XORGate, CircuitGate } from "./gate"
import { pointInRect } from "./utils"
import { IONode } from "./ionode"
import { UI } from "./ui";
import { SerializedObject } from "./circuit";
import challenges from "./challenges";
import Storage from "./storage"

export class Builder
{
    public canvas : Canvas;
    public container : HTMLElement;
    public circuit : CircuitGate;
    public mouse : { x : number, y : number } = { x: 0, y: 0 };

    public movingGate : GraphicsGate;
    public movingOffset : { x : number, y : number };

    private connectingGate : GraphicsGate;
    private connectingOutput : number;

    private connectingNode : GraphicsNode;

    public hovering : GraphicsGate;
    private parent : BuilderContainer;

    private hoverNode : IONode;

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

    constructor(parent : BuilderContainer, circuit : CircuitGate, width : number, height : number)
    {
        this.parent = parent;
        this.circuit = circuit;

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

        this.build();
        this.reset();
    }

    private build()
    {
        this.circuit.forEachGate((gate : CircuitGate) =>
        {
            gate.graphicsGate = new GraphicsGate(this.parent, gate);
        });

        this.circuit.forEachNode((node : IONode) =>
        {
            node.graphicsNode = new GraphicsNode(this.parent, node);
        });

        this.organizeNodes();
    }

    public die() : void
    {
        this.parent.container.removeChild(this.container);
    }

    public step() : void
    {
        this.circuit.step();
    }

    public reset() : void
    {
        let c = challenges[this.circuit.type];
        let inputs = c.expects[0].inputs;

        this.circuit.forEachInput((input : IONode, i : number) =>
        {
            input.value = inputs[i];
        });
    }

    public get height() : number
    {
        return this.canvas.height;
    }

    public get width() : number
    {
        return this.canvas.width;
    }

    public addNode(label : string, input : boolean, id : number = -1)
    {
        let n = this.circuit.addNode(new IONode(label), input, id);
        n.graphicsNode = new GraphicsNode(this.parent, n);
        this.organizeNodes();
    }

    public removeNode(node : GraphicsNode, isInput : boolean)
    {
        this.circuit.removeNode(node.node, isInput);
        this.organizeNodes();
    }

    public addGate(gate : CircuitGate, id? : number) : GraphicsGate
    {
        let g = this.circuit.addGate(gate, id);
        g.graphicsGate = new GraphicsGate(this.parent, g);
        return g.graphicsGate;
    }

    public removeGate(gate : GraphicsGate) : void
    {
        return this.circuit.removeGate(gate.gate);
    }

    public organizeNodes()
    {
        let workingHeight = this.height - this.padding * 2;
        let workingWidth = this.width - this.padding * 2;

        let padding = 16;

        this.circuit.forEachInput((node : IONode, i : number) =>
        {
            node.graphicsNode.x = this.padding + padding;
            node.graphicsNode.cy = this.padding + (workingHeight / (this.circuit.numInputs + 1)) * (i + 1);
        });

        this.circuit.forEachOutput((node : IONode, i : number) =>
        {
            node.graphicsNode.x = this.padding + workingWidth - padding - node.graphicsNode.size;
            node.graphicsNode.cy = this.padding + (workingHeight / (this.circuit.numOutputs + 1)) * (i + 1);
        });
    }

    public gateWithNode(node : IONode) : GraphicsGate
    {
        let g = this.circuit.gateWithNode(node);
        return g ? g.graphicsGate : null;
    }

    public draw() : void
    {
        this.canvas.clear();

        this.canvas.fill("rgba(0,0,0,0.5)");
        this.canvas.fillRoundedRect(this.padding, this.padding,
            this.width - this.padding * 2, this.height - this.padding * 2, 20, "rgba(255,255,255,0.5)");

        this.drawConnections();

        this.circuit.forEachGate(gate => gate.graphicsGate.drawGate(this.canvas));
        this.circuit.forEachGate(gate => gate.graphicsGate.drawNodes(this.canvas, false));
        this.circuit.forEachGate(gate => gate.graphicsGate.drawNodes(this.canvas, true));

        this.circuit.forEachNode(node => node.graphicsNode.draw(this.canvas));

        if (this.hoverNode)
        {
            this.hoverNode.graphicsNode.draw(this.canvas);
        }

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
            this.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, this.connectingGate.gate.getOutput(this.connectingOutput).color);
        }
        else if (this.connectingNode)
        {
            this.drawLine(this.connectingNode.cx, this.connectingNode.cy, this.mouse.x, this.mouse.y, this.connectingNode.node.color);
        }
    }

    public drawConnections() : void
    {
        this.circuit.forEachGate((gate : CircuitGate) =>
        {
            gate.forEachOutput((node : IONode, i : number) =>
            {
                let opt = gate.graphicsGate.nodePoint(i, false, true);
                
                node.outputNodes.forEach((inputNode : IONode, j : number) =>
                {
                    let ipt = this.nodePoint(inputNode);
                    this.drawLine(opt.x, opt.y, ipt.x, ipt.y, gate.getOutput(i).color);
                });
            });
        });

        this.circuit.forEachInput((cnode : IONode) =>
        {
            let node = cnode.graphicsNode;
            cnode.outputNodes.forEach((inputNode : IONode, i : number) =>
            {
                let ipt = this.nodePoint(inputNode);
                this.drawLine(node.cx, node.cy, ipt.x, ipt.y, node.node.color);
            });
        });
    }

    public nodePoint(node : IONode) : { x : number, y : number }
    {
        let nodeMatch : IONode;
        let gateMatch : GraphicsGate;

        window["node"] = node;
        
        if (nodeMatch = this.circuit.forEachNode(n => n === node)[0])
        {
            return { x: nodeMatch.graphicsNode.cx, y: nodeMatch.graphicsNode.cy };
        }
        else if (gateMatch = this.gateWithNode(node))
        {
            return gateMatch.nodePoint(gateMatch.gate.indexOfInput(node), true, true);
        }
        else
        {
            throw "cant find the node ://";
            //return null;
        }
    }

    public drawLine(x1, y1, x2, y2, color : string)
    {
        this.canvas.drawLine(x1, y1, x2, y2, color, 2);
    }

    private mouseDown(x : number, y : number, e : MouseEvent) : void
    {
        e.preventDefault();

        let hoveredGate = this.hoveredGate();
        let n : IONode;

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
        else if (n = this.circuit.forEachInput(node => node.graphicsNode.containsPoint(x, y))[0])
        {
            if (e.button === 0)
            {
                n.value = n.value ^ 1;
            }
            else if (e.button === 2)
            {
                this.connectingNode = n.graphicsNode;
            }
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
            this.hoverNode = null;
    
            if (hoveredGate
                || (this.hoverNode = this.circuit.forEachNode(node => 
                        node.graphicsNode.containsPoint(x, y))[0]))
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

        let n : IONode = null;

        if (this.connectingGate)
        {
            let h = this.hoveredGate();
            if (h && h !== this.connectingGate)
            {
                this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
            }
            else if (n = this.circuit.forEachOutput(node => node.graphicsNode.containsPoint(x, y))[0])
            {
                this.connectingGate.connectNode(this.connectingOutput, n.graphicsNode);
            }
        }
        else if (this.connectingNode)
        {
            let h = this.hoveredGate();
            if (h)
            {
                this.connectingNode.node.connect(h.gate.getInput(h.getConnectingInput(y)));
            }
            else if (n = this.circuit.forEachOutput(node => node.graphicsNode.containsPoint(x, y))[0])
            {
                this.connectingNode.node.connect(n);
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

        let gates = this.circuit.forEachGate(gate => gate.graphicsGate.containsPoint(this.mouse.x, this.mouse.y));
        let ret = gates.length > 0 ? gates[gates.length - 1].graphicsGate : null;

        if (ret)
        {
            ret.hovered = true;
        }

        this.hovering = ret;

        return ret;
    }

    public save()
    {
        challenges[this.circuit.type].solution = JSON.stringify(this.circuit.serializeCircuit());
        Storage.set(this.circuit.type,
        {
            solved: challenges[this.circuit.type].solved,
            solution: challenges[this.circuit.type].solution
        });
    }

    public test()
    {
        let expects = challenges[this.circuit.type].expects;

        expects.forEach(e =>
        {
            e.inputs.forEach((value : number, i : number) =>
            {
                this.circuit.getInput(i).value = value;
            });
            
            let passed = true;

            e.outputs.forEach((value : number, i : number) =>
            {
                if (this.circuit.getOutput(i).value !== value)
                {
                    passed = false;
                }
            });

            if (passed)
            {
                console.log("passed " + JSON.stringify(e.inputs));
            }
            else
            {
                console.log("failed " + JSON.stringify(e.inputs));
            }
        });


    }
}

export class GraphicsNode
{
    public x : number = 0;
    public y : number = 0;
    public size : number = 32;
    public node : IONode;
    public colorIndex : number;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer, node : IONode)
    {
        this.parent = parent;
        this.node = node;
        this.colorIndex = Builder.ColorIndex++;
    }

    public get id() : number
    {
        return this.node.id;
    }

    public set id(id : number)
    {
        this.node.id = id;
    }

    public draw(canvas : Canvas) : void
    {
        canvas.fillCircleInSquare(this.x, this.y, this.size, this.node.color);
        canvas.drawCircleInSquare(this.x, this.y, this.size, "black", 2);

        if (this.node.value !== IONode.NO_VALUE)
        {
            canvas.fillText(this.node.value, this.cx, this.cy, "black",
                "middle", "center", "16px monospace");
        }
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
    public width : number = 64;
    public height : number = 24;
    private color : string = "#fff";
    public gate : CircuitGate;
    public nodeSize : number = 12;
    private nodePadding : number = 8;
    public hovered : boolean = false;
    public colorIndex : number;
    public parent : BuilderContainer;

    constructor(parent : BuilderContainer, gate : CircuitGate)
    {
        this.parent = parent;
        this.gate = gate;
        let nodes = Math.max(gate.numInputs, gate.numOutputs);
        this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
        this.colorIndex = Builder.ColorIndex++;
    }

    public get x() : number
    {
        return this.gate.x;
    }

    public get y() : number
    {
        return this.gate.y;
    }

    public set x(x)
    {
        this.gate.x = x;
    }

    public set y(y)
    {
        this.gate.y = y;
    }

    public get id() : number
    {
        return this.gate.id;
    }

    public set id(id)
    {
        this.gate.id = id;
    }

    public toHTMLElement() : HTMLElement
    {
        let c = new Canvas({ width: this.width + this.nodeSize * 2, height: this.height + 8 });

        let _x = this.x;
        let _y = this.y;

        this.x = this.nodeSize;
        this.y = 4;
        this.drawGate(c);
        this.drawNodes(c, true);
        this.drawNodes(c, false);

        let container = document.createElement("div");
        container.className = "gate";
        container.appendChild(c.canvas);

        this.x = _x;
        this.y = _y;

        return container;
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
        let fn = input ? this.gate.forEachInput : this.gate.forEachOutput;

        fn.call(this.gate, (node, i) =>
        {
            let pt = this.nodePoint(i, input);

            canvas.fillRoundedRect(
                pt.x,
                pt.y,
                this.nodeSize,
                this.nodeSize,
                5,
                node.color,
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
        });
    }

    public nodePoint(index : number, input : boolean, corrected? : boolean) : { x : number, y : number }
    {
        if (corrected === undefined) corrected = false;
        
        let numNodes = input ? this.gate.numInputs : this.gate.numOutputs;
        let padding = (this.height - numNodes * this.nodeSize) / (numNodes + 1);

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
        let slices = input ? this.gate.numInputs : this.gate.numOutputs;
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
        let o = this.gate.connect(output, gate.gate, input);

        if (o.result.success)
        {
            return o.result.oustedNode;
        }
        else
        {
            o.srcNode.disconnect(o.destNode);
            return null;
        }
    }

    public connectNode(output : number, node : GraphicsNode) : IONode
    {
        let o = this.gate.connectNode(output, node.node);

        if (o.result.success)
        {
            return o.result.oustedNode;
        }
        else
        {
            o.srcNode.disconnect(o.destNode);
        }
    }

    public serialize() : SerializedObject
    {
        return this.gate.serialize();
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

    public build(type : string)
    {
        this.element.innerHTML = "";
        this.children = [];

        this.appendGateElement(new ANDGate());
        this.appendGateElement(new ORGate());
        this.appendGateElement(new XORGate());

        for (let type in challenges)
        {
            let c = challenges[type];
            if (c.solved && c.type !== type)
            {
                this.appendGateElement(CircuitGate.ofType(c.type));
            }
        }
    }

    private createGateElement(gate : CircuitGate) : HTMLElement
    {
        let g = new GraphicsGate(this.parent, gate.clone());
        let e = g.toHTMLElement();
        let c = e.firstElementChild;

        new Canvas({ canvasElement: c }).mouse.addEventListener("down", (x : number, y : number, e : MouseEvent) =>
        {
            this.spawnGate(gate.clone(), x, y, e);
        });
        
        return e;
    }

    private appendChild(element : HTMLElement)
    {
        this.element.appendChild(element);
        this.children.push(element);
    }

    public appendGateElement(gate : CircuitGate) : void
    {
        this.appendChild(this.createGateElement(gate));
    }

    private spawnGate(gate : CircuitGate, x : number, y : number, e : MouseEvent)
    {
        let g = this.parent.builder.addGate(gate.clone());
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

        this.makeButton("img/play.png", "Test", ()=>
        {
            this.parent.builder.test();
        });

        this.makeButton("img/save.png", "Save", () =>
        {
            this.parent.builder.save();
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

        this.overlay = new Canvas({ width: resX * (10/9), height: resY });
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
        this.builder && this.builder.die();

        this.builder = new Builder(this, gate.clone(), this.resX, this.resY);
        this.gateList.build(gate.type);
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
}