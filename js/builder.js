var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./canvas", "./gate", "./utils", "./ionode", "./ui", "./challenges", "./storage"], function (require, exports, canvas_1, gate_1, utils_1, ionode_1, ui_1, challenges_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Builder = (function () {
        function Builder(parent, circuit, width, height) {
            var _this = this;
            this.mouse = { x: 0, y: 0 };
            this.saved = true;
            this.padding = 32;
            this.parent = parent;
            this.circuit = circuit;
            this.canvas = new canvas_1.Canvas({ width: width, height: height, align: {
                    horizontal: true,
                    vertical: true
                } });
            this.container = document.createElement("div");
            this.container.appendChild(this.canvas.canvas);
            this.canvas.mouse.addEventListener("move", this.mouseMove.bind(this));
            this.canvas.mouse.addEventListener("down", this.mouseDown.bind(this));
            this.canvas.mouse.addEventListener("up", this.mouseUp.bind(this));
            this.canvas.canvas.oncontextmenu = function (e) {
                e.preventDefault();
                return false;
            };
            this.container.className = "builder";
            parent.container.appendChild(this.container);
            this.gateInfoWidget = new GateInfoWidget(this);
            this.gateErrorWidget = new GateErrorWidget(this);
            this.saveWidget = new PopupYesNo(this, "Save?", "Do you want to save your work before exiting?", function () { _this.save(); _this.exit(true); }, function () { return _this.exit(true); });
            this.successWidget = new PopupMessage(this, "Success!", "Good job! This circuit is now usable as a gate in other circuits!");
            this.build();
            this.reset();
        }
        Builder.prototype.exit = function (force) {
            if (force === void 0) { force = false; }
            if (!this.saved && !force) {
                this.saveWidget.show();
            }
            else {
                this.die();
                this.parent.parent.show(ui_1.UI.CHALLENGES);
            }
        };
        Builder.prototype.build = function () {
            var _this = this;
            this.circuit.forEachGate(function (gate) {
                gate.graphicsGate = new GraphicsGate(_this.parent, gate);
            });
            this.circuit.forEachNode(function (node) {
                node.graphicsNode = new GraphicsNode(_this.parent, node);
            });
            this.parent.gateList.build(this.circuit.type);
            this.organizeNodes();
        };
        Builder.prototype.die = function () {
            console.log(this.parent.container);
            this.parent.container.removeChild(this.gateErrorWidget.container);
            this.parent.container.removeChild(this.gateInfoWidget.container);
            this.parent.container.removeChild(this.saveWidget.container);
            this.parent.container.removeChild(this.successWidget.container);
            this.parent.container.removeChild(this.container);
        };
        Builder.prototype.step = function () {
            this.circuit.step();
        };
        Builder.prototype.reset = function () {
            var c = challenges_1.default[this.circuit.type];
            var inputs = c.expects[0].inputs;
            this.circuit.forEachInput(function (input, i) {
                input.value = inputs[i];
            });
        };
        Object.defineProperty(Builder.prototype, "height", {
            get: function () {
                return this.canvas.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Builder.prototype, "width", {
            get: function () {
                return this.canvas.width;
            },
            enumerable: true,
            configurable: true
        });
        Builder.prototype.addNode = function (label, input, id) {
            if (id === void 0) { id = -1; }
            var n = this.circuit.addNode(new ionode_1.IONode(label), input, id);
            n.graphicsNode = new GraphicsNode(this.parent, n);
            this.organizeNodes();
            this.saved = false;
        };
        Builder.prototype.removeNode = function (node, isInput) {
            this.circuit.removeNode(node.node, isInput);
            this.organizeNodes();
            this.saved = false;
        };
        Builder.prototype.addGate = function (gate, id) {
            var g = this.circuit.addGate(gate, id);
            g.graphicsGate = new GraphicsGate(this.parent, g);
            this.saved = false;
            return g.graphicsGate;
        };
        Builder.prototype.removeGate = function (gate) {
            this.saved = false;
            if (gate === this.hovering) {
                this.hovering = null;
            }
            return this.circuit.removeGate(gate.gate);
        };
        Builder.prototype.organizeNodes = function () {
            var _this = this;
            var workingHeight = this.height - this.padding * 2;
            var workingWidth = this.width - this.padding * 2;
            var padding = 16;
            this.circuit.forEachInput(function (node, i) {
                node.graphicsNode.x = _this.padding + padding;
                node.graphicsNode.cy = _this.padding + (workingHeight / (_this.circuit.numInputs + 1)) * (i + 1);
            });
            this.circuit.forEachOutput(function (node, i) {
                node.graphicsNode.x = _this.padding + workingWidth - padding - node.graphicsNode.size;
                node.graphicsNode.cy = _this.padding + (workingHeight / (_this.circuit.numOutputs + 1)) * (i + 1);
            });
        };
        Builder.prototype.gateWithNode = function (node) {
            var g = this.circuit.gateWithNode(node);
            return g ? g.graphicsGate : null;
        };
        Builder.prototype.draw = function () {
            var _this = this;
            this.canvas.clear();
            this.canvas.fill("rgba(0,0,0,0.5)");
            this.canvas.fillRoundedRect(this.padding, this.padding, this.width - this.padding * 2, this.height - this.padding * 2, 20, "rgba(255,255,255,0.5)");
            this.drawConnections();
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawGate(_this.canvas); });
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawNodes(_this.canvas, false); });
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawNodes(_this.canvas, true); });
            this.circuit.forEachNode(function (node) { return node.graphicsNode.draw(_this.canvas); });
            if (this.hoverNode) {
                this.hoverNode.graphicsNode.draw(this.canvas);
            }
            if (this.hovering) {
                this.hovering.drawGate(this.movingGate ? this.parent.overlay : this.canvas);
                this.hovering.drawNodes(this.movingGate ? this.parent.overlay : this.canvas, true);
                this.hovering.drawNodes(this.movingGate ? this.parent.overlay : this.canvas, false);
            }
            if (this.connectingGate) {
                var opt = this.connectingGate.nodePoint(this.connectingOutput, false, true);
                this.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, this.connectingGate.gate.getOutput(this.connectingOutput).color);
            }
            else if (this.connectingNode) {
                this.drawLine(this.connectingNode.cx, this.connectingNode.cy, this.mouse.x, this.mouse.y, this.connectingNode.node.color);
            }
        };
        Builder.prototype.drawConnections = function () {
            var _this = this;
            this.circuit.forEachGate(function (gate) {
                gate.forEachOutput(function (node, i) {
                    var opt = gate.graphicsGate.nodePoint(i, false, true);
                    node.outputNodes.forEach(function (inputNode, j) {
                        var ipt = _this.nodePoint(inputNode);
                        _this.drawLine(opt.x, opt.y, ipt.x, ipt.y, gate.getOutput(i).color);
                    });
                });
            });
            this.circuit.forEachInput(function (cnode) {
                var node = cnode.graphicsNode;
                cnode.outputNodes.forEach(function (inputNode, i) {
                    var ipt = _this.nodePoint(inputNode);
                    _this.drawLine(node.cx, node.cy, ipt.x, ipt.y, node.node.color);
                });
            });
        };
        Builder.prototype.nodePoint = function (node) {
            var nodeMatch;
            var gateMatch;
            window["node"] = node;
            if (nodeMatch = this.circuit.forEachNode(function (n) { return n === node; })[0]) {
                return { x: nodeMatch.graphicsNode.cx, y: nodeMatch.graphicsNode.cy };
            }
            else if (gateMatch = this.gateWithNode(node)) {
                return gateMatch.nodePoint(gateMatch.gate.indexOfInput(node), true, true);
            }
            else {
                throw "cant find the node ://";
            }
        };
        Builder.prototype.drawLine = function (x1, y1, x2, y2, color) {
            this.canvas.drawLine(x1, y1, x2, y2, color, 2);
        };
        Builder.prototype.mouseDown = function (x, y, e) {
            e.preventDefault();
            var hoveredGate = this.hoveredGate();
            var n;
            if (hoveredGate) {
                if (e.button === 0) {
                    this.movingGate = hoveredGate;
                    this.movingOffset = {
                        x: hoveredGate.x - this.mouse.x,
                        y: hoveredGate.y - this.mouse.y
                    };
                    this.parent.showOverlay();
                }
                else if (e.button === 2) {
                    this.connectingGate = hoveredGate;
                    this.connectingOutput = hoveredGate.getConnectingOutput(y);
                }
            }
            else if (n = this.circuit.forEachInput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                if (e.button === 0) {
                    n.value = n.value ^ 1;
                }
                else if (e.button === 2) {
                    this.connectingNode = n.graphicsNode;
                }
            }
        };
        Builder.prototype.mouseMove = function (x, y, mouseDown, lx, ly, ox, oy, e) {
            e.preventDefault();
            this.mouse.x = x;
            this.mouse.y = y;
            if (this.movingGate) {
                this.movingGate.x = x + this.movingOffset.x;
                this.movingGate.y = y + this.movingOffset.y;
            }
            else if (this.connectingGate) {
            }
            else if (this.connectingNode) {
            }
            else {
                var hoveredGate = this.hoveredGate();
                this.hoverNode = null;
                if (hoveredGate
                    || (this.hoverNode = this.circuit.forEachNode(function (node) {
                        return node.graphicsNode.containsPoint(x, y);
                    })[0])) {
                    this.canvas.canvas.style.cursor = "pointer";
                    this.parent.overlay.canvas.style.cursor = "pointer";
                }
                else {
                    this.canvas.canvas.style.cursor = "default";
                    this.parent.overlay.canvas.style.cursor = "default";
                }
            }
        };
        Builder.prototype.mouseUp = function (x, y, ox, oy, e) {
            e.preventDefault();
            this.movingGate = null;
            var n = null;
            if (this.connectingGate) {
                var h = this.hoveredGate();
                if (h && h !== this.connectingGate && h.gate.numInputs > 0) {
                    this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
                    this.saved = false;
                }
                else if (n = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                    this.connectingGate.connectNode(this.connectingOutput, n.graphicsNode);
                    this.saved = false;
                }
            }
            else if (this.connectingNode) {
                var h = this.hoveredGate();
                if (h) {
                    this.connectingNode.node.connect(h.gate.getInput(h.getConnectingInput(y)));
                    this.saved = false;
                }
                else if (n = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                    this.connectingNode.node.connect(n);
                    this.saved = false;
                }
            }
            this.connectingGate = null;
            this.connectingNode = null;
        };
        Builder.prototype.hoveredGate = function () {
            var _this = this;
            if (this.hovering) {
                this.hovering.hovered = false;
            }
            var gates = this.circuit.forEachGate(function (gate) { return gate.graphicsGate.containsPoint(_this.mouse.x, _this.mouse.y); });
            var ret = gates.length > 0 ? gates[gates.length - 1].graphicsGate : null;
            if (ret) {
                ret.hovered = true;
            }
            this.hovering = ret;
            return ret;
        };
        Builder.prototype.save = function () {
            challenges_1.default[this.circuit.type].solution = JSON.stringify(this.circuit.serializeCircuit());
            storage_1.default.set(this.circuit.type, {
                solved: challenges_1.default[this.circuit.type].solved,
                solution: challenges_1.default[this.circuit.type].solution
            });
            this.saved = true;
        };
        Builder.prototype.test = function () {
            var _this = this;
            var expects = challenges_1.default[this.circuit.type].expects;
            var wrong = [];
            expects.forEach(function (e) {
                e.inputs.forEach(function (value, i) {
                    _this.circuit.getInput(i).value = value;
                });
                var passed = true;
                e.outputs.forEach(function (value, i) {
                    if (_this.circuit.getOutput(i).value !== value) {
                        passed = false;
                    }
                });
                if (!passed) {
                    wrong.push({
                        expected: e,
                        given: _this.circuit.outputValues
                    });
                }
            });
            if (wrong.length === 0) {
                this.successWidget.show();
                challenges_1.default[this.circuit.type].solved = true;
                this.save();
            }
            else {
                this.gateErrorWidget.clear();
                wrong.forEach(function (thing) {
                    _this.gateErrorWidget.addError(thing.expected, thing.given);
                });
                this.gateErrorWidget.show();
                challenges_1.default[this.circuit.type].solved = false;
            }
        };
        return Builder;
    }());
    exports.Builder = Builder;
    var GraphicsNode = (function () {
        function GraphicsNode(parent, node) {
            this.x = 0;
            this.y = 0;
            this.size = 32;
            this.parent = parent;
            this.node = node;
        }
        Object.defineProperty(GraphicsNode.prototype, "id", {
            get: function () {
                return this.node.id;
            },
            set: function (id) {
                this.node.id = id;
            },
            enumerable: true,
            configurable: true
        });
        GraphicsNode.prototype.draw = function (canvas) {
            canvas.fillCircleInSquare(this.x, this.y, this.size, this.node.color);
            canvas.drawCircleInSquare(this.x, this.y, this.size, "black", 2);
            if (this.node.value !== ionode_1.IONode.NO_VALUE) {
                canvas.fillText(this.node.value, this.cx, this.cy, "black", "middle", "center", "16px monospace");
            }
        };
        Object.defineProperty(GraphicsNode.prototype, "cx", {
            get: function () {
                return this.x + this.size / 2;
            },
            set: function (cx) {
                this.x = cx - this.size / 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GraphicsNode.prototype, "cy", {
            get: function () {
                return this.y + this.size / 2;
            },
            set: function (cy) {
                this.y = cy - this.size / 2;
            },
            enumerable: true,
            configurable: true
        });
        GraphicsNode.prototype.containsPoint = function (x, y) {
            return utils_1.pointInRect(x, y, this.x, this.y, this.size, this.size);
        };
        return GraphicsNode;
    }());
    exports.GraphicsNode = GraphicsNode;
    var GraphicsGate = (function () {
        function GraphicsGate(parent, gate) {
            this.width = 64;
            this.height = 24;
            this.color = "#fff";
            this.nodeSize = 12;
            this.nodePadding = 8;
            this.hovered = false;
            this.parent = parent;
            this.gate = gate;
            var nodes = Math.max(gate.numInputs, gate.numOutputs);
            this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
            this.width = 24 + ((64 - 24) / 3) * this.gate.label.length;
        }
        Object.defineProperty(GraphicsGate.prototype, "x", {
            get: function () {
                return this.gate.x;
            },
            set: function (x) {
                this.gate.x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GraphicsGate.prototype, "y", {
            get: function () {
                return this.gate.y;
            },
            set: function (y) {
                this.gate.y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GraphicsGate.prototype, "id", {
            get: function () {
                return this.gate.id;
            },
            set: function (id) {
                this.gate.id = id;
            },
            enumerable: true,
            configurable: true
        });
        GraphicsGate.prototype.toHTMLElement = function () {
            var c = new canvas_1.Canvas({ width: this.width + this.nodeSize * 2, height: this.height + 8 });
            var _x = this.x;
            var _y = this.y;
            this.x = this.nodeSize;
            this.y = 4;
            this.drawGate(c);
            this.drawNodes(c, true);
            this.drawNodes(c, false);
            var container = document.createElement("div");
            container.className = "gate";
            container.appendChild(c.canvas);
            this.x = _x;
            this.y = _y;
            return container;
        };
        GraphicsGate.prototype.drawGate = function (canvas) {
            canvas.fillRoundedRect(this.x, this.y, this.width, this.height, 5, this.color, false);
            canvas.drawRoundedRect(this.x, this.y, this.width, this.height, 5, "black", 2, false);
            canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "black", "middle", "center", "24px monospace");
        };
        GraphicsGate.prototype.drawNodes = function (canvas, input, drawLabels) {
            var _this = this;
            if (drawLabels === undefined)
                drawLabels = this.hovered;
            var fn = input ? this.gate.forEachInput : this.gate.forEachOutput;
            fn.call(this.gate, function (node, i) {
                node.noValueColor = _this.color;
                var pt = _this.nodePoint(i, input);
                canvas.fillRoundedRect(pt.x, pt.y, _this.nodeSize, _this.nodeSize, 5, node.color, false);
                canvas.drawRoundedRect(pt.x, pt.y, _this.nodeSize, _this.nodeSize, 3, "black", 2, false);
                if (drawLabels) {
                    var fontSize = 14;
                    var fontSize2 = fontSize + 2;
                    canvas.fillText(node.label, pt.x + (input ? -_this.nodeSize / 2 : _this.nodeSize + _this.nodeSize / 2), pt.y + _this.nodeSize / 2, "white", "middle", input ? "right" : "left", fontSize + "px monospace");
                    canvas.fillText(node.label, pt.x + (input ? -_this.nodeSize / 2 : _this.nodeSize + _this.nodeSize / 2), pt.y + _this.nodeSize / 2, "black", "middle", input ? "right" : "left", fontSize + "px monospace");
                }
            });
        };
        GraphicsGate.prototype.nodePoint = function (index, input, corrected) {
            if (corrected === undefined)
                corrected = false;
            var numNodes = input ? this.gate.numInputs : this.gate.numOutputs;
            var padding = (this.height - numNodes * this.nodeSize) / (numNodes + 1);
            return {
                x: this.x - (corrected ? 0 : this.nodeSize / 2) + (input ? 0 : this.width),
                y: this.y + padding * (index + 1) + this.nodeSize * index + (corrected ? this.nodeSize / 2 : 0)
            };
        };
        GraphicsGate.prototype.containsPoint = function (x, y) {
            return utils_1.pointInRect(x, y, this.x - this.nodeSize, this.y, this.width + this.nodeSize * 2, this.height);
        };
        GraphicsGate.prototype.nodeIndexFromY = function (y, input) {
            var slices = input ? this.gate.numInputs : this.gate.numOutputs;
            var localY = y - this.y;
            var h = this.height / slices;
            return ~~(localY / h);
        };
        GraphicsGate.prototype.getConnectingOutput = function (y) {
            return this.nodeIndexFromY(y, false);
        };
        GraphicsGate.prototype.getConnectingInput = function (y) {
            return this.nodeIndexFromY(y, true);
        };
        GraphicsGate.prototype.connect = function (output, gate, input) {
            var o = this.gate.connect(output, gate.gate, input);
            if (o.result.success) {
                return o.result.oustedNode;
            }
            else {
                o.srcNode.disconnect(o.destNode);
                return null;
            }
        };
        GraphicsGate.prototype.connectNode = function (output, node) {
            var o = this.gate.connectNode(output, node.node);
            if (o.result.success) {
                return o.result.oustedNode;
            }
            else {
                o.srcNode.disconnect(o.destNode);
            }
        };
        GraphicsGate.prototype.serialize = function () {
            return this.gate.serialize();
        };
        return GraphicsGate;
    }());
    exports.GraphicsGate = GraphicsGate;
    var GateList = (function () {
        function GateList(parent) {
            this.children = [];
            this.element = document.createElement("div");
            this.element.className = "gateList";
            parent.container.appendChild(this.element);
            this.parent = parent;
        }
        GateList.prototype.build = function (circuitType) {
            this.element.innerHTML = "";
            this.children = [];
            this.appendGateElement(new gate_1.ZeroGate());
            this.appendGateElement(new gate_1.OneGate());
            this.appendGateElement(new gate_1.NOTGate());
            this.appendGateElement(new gate_1.ANDGate());
            this.appendGateElement(new gate_1.ORGate());
            var _loop_1 = function (type) {
                var c = challenges_1.default[type];
                var forbid = new Set();
                var t = gate_1.CircuitGate.ofType(c.type);
                t.forEachGate(function (gate) { return forbid.add(gate.type); });
                if (c.solved && c.type !== circuitType && !forbid.has(circuitType)) {
                    this_1.appendGateElement(t);
                }
            };
            var this_1 = this;
            for (var type in challenges_1.default) {
                _loop_1(type);
            }
        };
        GateList.prototype.createGateElement = function (gate) {
            var _this = this;
            var g = new GraphicsGate(this.parent, gate.clone());
            var e = g.toHTMLElement();
            var c = e.firstElementChild;
            new canvas_1.Canvas({ canvasElement: c }).mouse.addEventListener("down", function (x, y, e) {
                _this.spawnGate(gate.clone(), x, y, e);
            });
            return e;
        };
        GateList.prototype.appendChild = function (element) {
            this.element.appendChild(element);
            this.children.push(element);
        };
        GateList.prototype.appendGateElement = function (gate) {
            this.appendChild(this.createGateElement(gate));
        };
        GateList.prototype.spawnGate = function (gate, x, y, e) {
            var g = this.parent.builder.addGate(gate.clone());
            this.parent.builder.hovering = g;
            this.parent.builder.movingGate = g;
            this.parent.builder.movingOffset = { x: -g.width / 2, y: -g.height / 2 };
            g.x = this.element.getBoundingClientRect().left + this.children[0].getBoundingClientRect().left;
            this.parent.showOverlay();
        };
        return GateList;
    }());
    exports.GateList = GateList;
    var Toolbar = (function () {
        function Toolbar(parent) {
            var _this = this;
            this.container = document.createElement("div");
            this.container.className = "toolbar";
            this.parent = parent;
            parent.container.appendChild(this.container);
            this.makeButton("img/back.png", "Back", function () {
                _this.parent.builder.exit();
            });
            this.makeButton("img/play.png", "Test", function () {
                _this.parent.builder.test();
            });
            this.makeButton("img/save.png", "Save", function () {
                _this.parent.builder.save();
            });
            this.makeButton("img/info.png", "Info", function () {
                _this.parent.builder.gateInfoWidget.show();
            });
        }
        Toolbar.prototype.makeButton = function (imgSrc, text, onclick) {
            var c = document.createElement("div");
            c.className = "toolbar-button";
            var i = document.createElement("img");
            i.src = imgSrc;
            c.appendChild(i);
            var l = document.createElement("div");
            l.innerText = text;
            c.appendChild(l);
            c.addEventListener("click", onclick);
            this.container.appendChild(c);
        };
        return Toolbar;
    }());
    exports.Toolbar = Toolbar;
    var BuilderContainer = (function () {
        function BuilderContainer(parent, resX, resY) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-builder";
            this.builder = null;
            this.gateList = new GateList(this);
            this.toolbar = new Toolbar(this);
            this.resX = resX;
            this.resY = resY;
            this.overlay = new canvas_1.Canvas({ width: resX * (100 / 89), height: resY });
            this.overlay.canvas.className = "overlay";
            this.container.appendChild(this.overlay.canvas);
            this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
            this.overlay.mouse.addEventListener("up", this.mouseUp.bind(this));
            parent.container.appendChild(this.container);
            this.hideOverlay();
            window.requestAnimationFrame(this.drawReq.bind(this));
            this.parent.container.appendChild(this.container);
        }
        BuilderContainer.prototype.editGate = function (gate) {
            this.builder = new Builder(this, gate.clone(), this.resX, this.resY);
        };
        BuilderContainer.prototype.showOverlay = function () {
            this.overlay.canvas.style["z-index"] = 1;
        };
        BuilderContainer.prototype.hideOverlay = function () {
            this.overlay.canvas.style["z-index"] = -1;
        };
        BuilderContainer.prototype.mouseUp = function (x, y, ox, oy, e) {
            var gate = this.builder.movingGate;
            this.builder.mouseUp.call(this.builder, x, y, ox, oy, e);
            if (x > this.overlay.width * 0.9) {
                this.builder.removeGate(gate);
            }
            if (y > this.resY) {
                gate.y = this.resY - gate.height;
            }
            this.hideOverlay();
        };
        BuilderContainer.prototype.mouseMove = function (x, y, mouseDown, lx, ly, ox, oy, e) {
            this.builder.mouseMove.call(this.builder, x, y, mouseDown, lx, ly, ox, oy, e);
        };
        BuilderContainer.prototype.draw = function () {
            if (!this.builder)
                return;
            this.overlay.clear();
            if (this.builder.movingGate) {
                if (this.builder.mouse.x > this.overlay.width * 0.9) {
                    this.overlay.fillRect(this.overlay.width * 0.9, 0, this.overlay.width * 0.1, this.overlay.height, "rgba(255,0,0,0.3)");
                }
            }
            this.builder.draw();
        };
        BuilderContainer.prototype.drawReq = function () {
            this.draw();
            window.requestAnimationFrame(this.drawReq.bind(this));
        };
        Object.defineProperty(BuilderContainer.prototype, "size", {
            get: function () {
                var c = this.container.getBoundingClientRect();
                return { width: c.width, height: c.height };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BuilderContainer.prototype, "innerSize", {
            get: function () {
                return { width: this.container.offsetWidth, height: this.container.offsetHeight };
            },
            enumerable: true,
            configurable: true
        });
        return BuilderContainer;
    }());
    exports.BuilderContainer = BuilderContainer;
    var PopupWidget = (function () {
        function PopupWidget(parent) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "popup";
            this.container.onclick = this.hide.bind(this);
            this.innerContainer = document.createElement("div");
            this.innerContainer.className = "inner";
            this.innerContainer.onclick = function (e) { return e.stopPropagation(); };
            this.container.appendChild(this.innerContainer);
            this.okButton = document.createElement("button");
            this.okButton.className = "close";
            this.okButton.innerText = "OK";
            this.okButton.onclick = this.hide.bind(this);
            this.innerContainer.appendChild(this.okButton);
            this.parent.parent.container.appendChild(this.container);
            this.hide();
        }
        PopupWidget.prototype.hide = function () {
            utils_1.hideElement(this.container);
        };
        PopupWidget.prototype.show = function () {
            utils_1.showElement(this.container);
        };
        return PopupWidget;
    }());
    exports.PopupWidget = PopupWidget;
    var PopupMessage = (function (_super) {
        __extends(PopupMessage, _super);
        function PopupMessage(parent, title, message) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("popupMessage");
            var $title = document.createElement("h1");
            $title.innerText = title;
            $title.className = "title";
            _this.innerContainer.appendChild($title);
            var $message = document.createElement("div");
            $message.innerText = message;
            $message.className = "message";
            _this.innerContainer.appendChild($message);
            return _this;
        }
        return PopupMessage;
    }(PopupWidget));
    exports.PopupMessage = PopupMessage;
    var PopupYesNo = (function (_super) {
        __extends(PopupYesNo, _super);
        function PopupYesNo(parent, title, message, onyes, onno) {
            var _this = _super.call(this, parent, title, message) || this;
            _this.container.classList.add("popupYesNo");
            var n = _this.okButton.cloneNode();
            n.onclick = _this.okButton.onclick;
            var c = _this.okButton.cloneNode();
            c.onclick = _this.okButton.onclick;
            _this.okButton.innerText = "Yes";
            _this.okButton.classList.add("yes");
            _this.okButton.addEventListener("click", function () { return onyes(); });
            n.innerText = "No";
            n.addEventListener("click", function () { return onno(); });
            n.classList.add("no");
            _this.innerContainer.appendChild(n);
            c.innerText = "Cancel";
            c.classList.add("cancel");
            _this.innerContainer.appendChild(c);
            return _this;
        }
        return PopupYesNo;
    }(PopupMessage));
    exports.PopupYesNo = PopupYesNo;
    var GatePanelWidget = (function (_super) {
        __extends(GatePanelWidget, _super);
        function GatePanelWidget(parent) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("gatePanelWidget");
            _this.descriptionContainer = document.createElement("div");
            _this.descriptionContainer.className = "description";
            _this.innerContainer.appendChild(_this.descriptionContainer);
            _this.panelContainer = document.createElement("div");
            _this.panelContainer.className = "panelList";
            _this.innerContainer.appendChild(_this.panelContainer);
            return _this;
        }
        GatePanelWidget.prototype.addPanel = function (e) {
            this.panelContainer.appendChild(this.makePanel(this.parent.circuit, e.inputs, e.outputs));
        };
        GatePanelWidget.prototype.makePanel = function (gate, inputs, outputs) {
            gate = gate.clone();
            if (inputs) {
                gate.forEachInput(function (node, i) { return node.value = inputs[i]; });
            }
            if (outputs) {
                gate.forEachOutput(function (node, i) { return node.value = outputs[i]; });
            }
            var gg = gate.graphicsGate || new GraphicsGate(this.parent.parent, gate);
            var c = new canvas_1.Canvas({ width: gg.width * 4, height: gg.height });
            gg.y = 0;
            gg.x = gg.width * 1.5;
            gg.drawGate(c);
            gg.drawNodes(c, true, true);
            gg.drawNodes(c, false, true);
            var ret = document.createElement("div");
            ret.className = "panel";
            ret.appendChild(c.canvas);
            return ret;
        };
        return GatePanelWidget;
    }(PopupWidget));
    exports.GatePanelWidget = GatePanelWidget;
    var GateInfoWidget = (function (_super) {
        __extends(GateInfoWidget, _super);
        function GateInfoWidget(parent) {
            var _this = _super.call(this, parent) || this;
            var c = challenges_1.default[_this.parent.circuit.type];
            _this.descriptionContainer.innerHTML = c.description;
            c.expects.forEach(function (e, i) {
                _this.addPanel(e);
            });
            return _this;
        }
        return GateInfoWidget;
    }(GatePanelWidget));
    exports.GateInfoWidget = GateInfoWidget;
    var GateErrorWidget = (function (_super) {
        __extends(GateErrorWidget, _super);
        function GateErrorWidget(parent) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("gateErrorWidget");
            _this.descriptionContainer.innerText = "There were some errors...";
            return _this;
        }
        GateErrorWidget.prototype.clear = function () {
            this.panelContainer.innerHTML = "";
        };
        GateErrorWidget.prototype.addError = function (e, given) {
            var t = this.parent.circuit.type;
            var c = challenges_1.default[t];
            this.addLabel("Expected:");
            this.addPanel(e);
            e = utils_1.cloneJSON(e);
            e.outputs = given;
            this.addLabel("Given:");
            this.addPanel(e);
            this.panelContainer.appendChild(document.createElement("hr"));
        };
        GateErrorWidget.prototype.addLabel = function (str) {
            var label = document.createElement("div");
            label.className = "label";
            label.innerText = str;
            this.panelContainer.appendChild(label);
        };
        return GateErrorWidget;
    }(GatePanelWidget));
    exports.GateErrorWidget = GateErrorWidget;
});
