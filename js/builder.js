define(["require", "exports", "./canvas", "./gate", "./utils", "./ionode", "./challenges", "./storage"], function (require, exports, canvas_1, gate_1, utils_1, ionode_1, challenges_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Builder = (function () {
        function Builder(parent, circuit, width, height) {
            this.mouse = { x: 0, y: 0 };
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
            this.build();
        }
        Builder.prototype.build = function () {
            var _this = this;
            this.circuit.forEachGate(function (gate) {
                gate.graphicsGate = new GraphicsGate(_this.parent, gate);
            });
            this.circuit.forEachInput(function (node) {
                node.graphicsNode = new GraphicsNode(_this.parent, node);
            });
            this.circuit.forEachOutput(function (node) {
                node.graphicsNode = new GraphicsNode(_this.parent, node);
            });
            this.organizeNodes();
        };
        Builder.prototype.die = function () {
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
        };
        Builder.prototype.removeNode = function (node, isInput) {
            this.circuit.removeNode(node.node, isInput);
            this.organizeNodes();
        };
        Builder.prototype.addGate = function (gate, id) {
            var g = this.circuit.addGate(gate, id);
            g.graphicsGate = new GraphicsGate(this.parent, g);
            return g.graphicsGate;
        };
        Builder.prototype.removeGate = function (gate) {
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
            this.circuit.forEachInput(function (node) { return node.graphicsNode.draw(_this.canvas); });
            this.circuit.forEachOutput(function (node) { return node.graphicsNode.draw(_this.canvas); });
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawGate(_this.canvas); });
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawNodes(_this.canvas, false); });
            this.circuit.forEachGate(function (gate) { return gate.graphicsGate.drawNodes(_this.canvas, true); });
            this.drawConnections();
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
                this.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, this.connectingGate.colorIndex);
            }
            else if (this.connectingNode) {
                this.drawLine(this.connectingNode.cx, this.connectingNode.cy, this.mouse.x, this.mouse.y, this.connectingNode.colorIndex);
            }
        };
        Builder.prototype.drawConnections = function () {
            var _this = this;
            this.circuit.forEachGate(function (gate) {
                gate.forEachOutput(function (node, i) {
                    var opt = gate.graphicsGate.nodePoint(i, false, true);
                    node.outputNodes.forEach(function (inputNode, j) {
                        var ipt = _this.nodePoint(inputNode);
                        _this.drawLine(opt.x, opt.y, ipt.x, ipt.y, gate.graphicsGate.colorIndex);
                    });
                });
            });
            this.circuit.forEachInput(function (cnode) {
                var node = cnode.graphicsNode;
                cnode.outputNodes.forEach(function (inputNode, i) {
                    var ipt = _this.nodePoint(inputNode);
                    _this.drawLine(node.cx, node.cy, ipt.x, ipt.y, node.colorIndex);
                });
            });
        };
        Builder.prototype.nodePoint = function (node) {
            var nodeMatch;
            var gateMatch;
            window["node"] = node;
            if ((nodeMatch = this.circuit.forEachInput(function (n) { return n === node; })[0])
                || (nodeMatch = this.circuit.forEachOutput(function (n) { return n === node; })[0])) {
                return { x: nodeMatch.graphicsNode.cx, y: nodeMatch.graphicsNode.cy };
            }
            else if (gateMatch = this.gateWithNode(node)) {
                return gateMatch.nodePoint(gateMatch.gate.indexOfInput(node), true, true);
            }
            else {
                throw "cant find the node ://";
            }
        };
        Builder.prototype.drawLine = function (x1, y1, x2, y2, colorIndex) {
            this.canvas.drawLine(x1, y1, x2, y2, Builder.Colors[colorIndex], 2);
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
                this.connectingNode = n.graphicsNode;
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
                var p1 = this.connectingGate.nodePoint(this.connectingOutput, false);
            }
            else if (this.connectingNode) {
            }
            else {
                var hoveredGate = this.hoveredGate();
                this.hoverNode = null;
                if (hoveredGate
                    || (this.hoverNode = this.circuit.forEachInput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0])
                    || (this.hoverNode = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0])) {
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
                if (h && h !== this.connectingGate) {
                    this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
                }
                else if (n = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                    this.connectingGate.connectNode(this.connectingOutput, n.graphicsNode);
                }
            }
            else if (this.connectingNode) {
                var h = this.hoveredGate();
                if (h) {
                    this.connectingNode.node.connect(h.gate.getInput(h.getConnectingInput(y)));
                }
                else if (n = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                    this.connectingNode.node.connect(n);
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
        };
        Builder.Colors = [
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
        Builder.ColorIndex = 0;
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
            this.colorIndex = Builder.ColorIndex++;
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
            canvas.fillCircleInSquare(this.x, this.y, this.size, "white");
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
            this.colorIndex = Builder.ColorIndex++;
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
        GraphicsGate.prototype.drawNodes = function (canvas, input) {
            var _this = this;
            var fn = input ? this.gate.forEachInput : this.gate.forEachOutput;
            fn.call(this.gate, function (node, i) {
                var pt = _this.nodePoint(i, input);
                canvas.fillRoundedRect(pt.x, pt.y, _this.nodeSize, _this.nodeSize, 5, _this.color, false);
                canvas.drawRoundedRect(pt.x, pt.y, _this.nodeSize, _this.nodeSize, 3, "black", 2, false);
                if (_this.hovered) {
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
        GateList.prototype.build = function (type) {
            this.element.innerHTML = "";
            this.children = [];
            this.appendGateElement(new gate_1.ANDGate());
            this.appendGateElement(new gate_1.ORGate());
            this.appendGateElement(new gate_1.XORGate());
            for (var type_1 in challenges_1.default) {
                var c = challenges_1.default[type_1];
                if (c.solved && c.type !== type_1) {
                    this.appendGateElement(gate_1.CircuitGate.ofType(c.type));
                }
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
            this.makeButton("img/play.png", "Run", function () { });
            this.makeButton("img/step.png", "Step", function () {
                _this.parent.builder.step();
            });
            this.makeButton("img/save.png", "Save", function () {
                _this.parent.builder.save();
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
            this.overlay = new canvas_1.Canvas({ width: resX * (10 / 9), height: resY });
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
            this.builder && this.builder.die();
            this.builder = new Builder(this, gate.clone(), this.resX, this.resY);
            this.gateList.build(gate.type);
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
});
