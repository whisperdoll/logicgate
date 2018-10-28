import { Canvas } from "./canvas"
import { CircuitGate } from "./gate"
import { IONode } from "./ionode"
import { UI } from "./ui";
import challenges, { ChallengeExpectation } from "./challenges";
import Storage from "./storage"
import { GateInfoWidget, GateErrorWidget, PopupMessage, PopupYesNo } from "./popupwidgets";
import { GraphicsNode } from "./graphicsnode";
import { GraphicsGate } from "./graphicsgate";
import { BuilderContainer } from "./buildercontainer";

export class Builder
{
    public parent : BuilderContainer;
    public canvas : Canvas;
    public container : HTMLElement;
    public circuit : CircuitGate;

    public mouse : { x : number, y : number } = { x: 0, y: 0 };
    public saved : boolean = true;
    public padding : number = 32;

    public movingGate : GraphicsGate;
    public movingOffset : { x : number, y : number };

    private connectingGate : GraphicsGate;
    private connectingOutput : number;
    public hovering : GraphicsGate;
    private connectingNode : GraphicsNode;
    private hoverNode : IONode;

    public gateInfoWidget : GateInfoWidget;
    public gateErrorWidget : GateErrorWidget;
    public successWidget : PopupMessage;
    public saveWidget : PopupYesNo;

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

        this.gateInfoWidget = new GateInfoWidget(this);
        this.gateErrorWidget = new GateErrorWidget(this);
        this.saveWidget = new PopupYesNo(this, "Save?",
            "Do you want to save your work before exiting?",
            () => { this.save(); this.exit(true) }, () => this.exit(true));
        this.successWidget = new PopupMessage(this, "Success!",
            "Good job! This circuit is now usable as a gate in other circuits!");

        this.build();
        this.reset();

        /*if (!challenges[this.circuit.type].solved)
        {
            this.gateInfoWidget.show();
        }*/
    }

    public exit(force : boolean = false)
    {
        if (!this.saved && !force)
        {
            this.saveWidget.show();
        }
        else
        {
            this.die();
            this.parent.parent.show(UI.CHALLENGES);
        }
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

        this.parent.gateList.build(this.circuit.type);

        this.organizeNodes();
    }

    public die() : void
    {
        console.log(this.parent.container);
        this.parent.container.removeChild(this.gateErrorWidget.container);
        this.parent.container.removeChild(this.gateInfoWidget.container);
        this.parent.container.removeChild(this.saveWidget.container);
        this.parent.container.removeChild(this.successWidget.container);
        this.parent.container.removeChild(this.container);
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
        this.saved = false;
    }

    public removeNode(node : GraphicsNode, isInput : boolean)
    {
        this.circuit.removeNode(node.node, isInput);
        this.organizeNodes();
        this.saved = false;
    }

    public addGate(gate : CircuitGate, id? : number) : GraphicsGate
    {
        let g = this.circuit.addGate(gate, id);
        g.graphicsGate = new GraphicsGate(this.parent, g);
        this.saved = false;
        return g.graphicsGate;
    }

    public removeGate(gate : GraphicsGate) : void
    {
        this.saved = false;

        if (gate === this.hovering)
        {
            this.hovering = null;
        }

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
            //let p1 = this.connectingGate.nodePoint(this.connectingOutput, false);
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
            if (h && h !== this.connectingGate && h.gate.numInputs > 0)
            {
                this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
                this.saved = false;
            }
            else if (n = this.circuit.forEachOutput(node => node.graphicsNode.containsPoint(x, y))[0])
            {
                this.connectingGate.connectNode(this.connectingOutput, n.graphicsNode);
                this.saved = false;
            }
        }
        else if (this.connectingNode)
        {
            let h = this.hoveredGate();
            if (h)
            {
                this.connectingNode.node.connect(h.gate.getInput(h.getConnectingInput(y)));
                this.saved = false;
            }
            else if (n = this.circuit.forEachOutput(node => node.graphicsNode.containsPoint(x, y))[0])
            {
                this.connectingNode.node.connect(n);
                this.saved = false;
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

        this.saved = true;
    }

    public test()
    {
        let expects = challenges[this.circuit.type].expects;
        let wrong : { expected : ChallengeExpectation, given : number[] }[] = [];

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

            if (!passed)
            {
                wrong.push({
                    expected: e,
                    given: this.circuit.outputValues
                });
            }
        });

        if (wrong.length === 0)
        {
            this.successWidget.show();
            challenges[this.circuit.type].solved = true;
            this.save();
        }
        else
        {
            this.gateErrorWidget.clear();
            wrong.forEach(thing =>
            {
                this.gateErrorWidget.addError(thing.expected, thing.given);
            });
            this.gateErrorWidget.show();
            challenges[this.circuit.type].solved = false;
        }
    }
}