define(["require", "exports", "./canvas", "./ionode", "./ui", "./challenges", "./storage", "./popupwidgets", "./graphicsnode", "./graphicsgate"], function (require, exports, canvas_1, ionode_1, ui_1, challenges_1, storage_1, popupwidgets_1, graphicsnode_1, graphicsgate_1) {
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
            this.gateInfoWidget = new popupwidgets_1.GateInfoWidget(this);
            this.truthTableWidget = new popupwidgets_1.TruthTableWidget(this);
            this.gateErrorWidget = new popupwidgets_1.GateErrorWidget(this);
            this.saveWidget = new popupwidgets_1.PopupYesNo(this, "Save?", "Do you want to save your work before exiting?", function () { _this.save(); _this.exit(true); }, function () { return _this.exit(true); });
            this.successWidget = new popupwidgets_1.PopupMessage(this, "Success!", "Good job! This circuit is now usable as a gate in other circuits!");
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
                if (this.circuit.type === "sandbox") {
                    this.parent.parent.show(ui_1.UI.LANDING);
                }
                else {
                    this.parent.parent.show(ui_1.UI.CHALLENGES);
                }
            }
        };
        Builder.prototype.build = function () {
            var _this = this;
            this.circuit.forEachGate(function (gate) {
                gate.graphicsGate = new graphicsgate_1.GraphicsGate(_this.parent, gate);
            });
            this.circuit.forEachNode(function (node) {
                node.graphicsNode = new graphicsnode_1.GraphicsNode(_this.parent, node);
            });
            this.parent.gateList.build(this.circuit.type);
            this.organizeNodes();
        };
        Builder.prototype.die = function () {
            this.parent.container.removeChild(this.gateErrorWidget.container);
            this.parent.container.removeChild(this.gateInfoWidget.container);
            this.parent.container.removeChild(this.saveWidget.container);
            this.parent.container.removeChild(this.successWidget.container);
            this.parent.container.removeChild(this.container);
        };
        Builder.prototype.reset = function () {
            if (!challenges_1.default.hasOwnProperty(this.circuit.type)) {
                return;
            }
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
            var n = this.circuit.addNode(new ionode_1.IONode(label), input, id);
            if (input) {
                n.value = 0;
            }
            n.graphicsNode = new graphicsnode_1.GraphicsNode(this.parent, n);
            this.organizeNodes();
            this.saved = false;
        };
        Builder.prototype.removeNode = function (node, isInput) {
            this.circuit.removeNode(node.node, isInput);
            this.organizeNodes();
            this.saved = false;
        };
        Builder.prototype.removeInputNodeAtIndex = function (index) {
            this.removeNode(this.circuit.getInput(index).graphicsNode, true);
        };
        Builder.prototype.removeLastInputNode = function () {
            this.removeInputNodeAtIndex(this.circuit.numInputs - 1);
        };
        Builder.prototype.removeOutputNodeAtIndex = function (index) {
            this.removeNode(this.circuit.getOutput(index).graphicsNode, false);
        };
        Builder.prototype.removeLastOutputNode = function () {
            this.removeOutputNodeAtIndex(this.circuit.numOutputs - 1);
        };
        Builder.prototype.addGate = function (gate, id) {
            var g = this.circuit.addGate(gate, id);
            g.graphicsGate = new graphicsgate_1.GraphicsGate(this.parent, g);
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
        Object.defineProperty(Builder.prototype, "inputArray", {
            get: function () {
                var ret = [];
                this.circuit.forEachInput(function (node) {
                    ret.push(node.value);
                });
                return ret;
            },
            set: function (array) {
                this.circuit.forEachInput(function (node, i) {
                    node.value = array[i];
                });
            },
            enumerable: true,
            configurable: true
        });
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
                    var destNode = h.gate.getInput(h.getConnectingInput(y));
                    var o = this.connectingNode.node.connect(destNode);
                    this.saved = false;
                    if (!o.success) {
                        this.connectingNode.node.disconnect(destNode);
                    }
                }
                else if (n = this.circuit.forEachOutput(function (node) { return node.graphicsNode.containsPoint(x, y); })[0]) {
                    var o = this.connectingNode.node.connect(n);
                    this.saved = false;
                    if (!o.success) {
                        this.connectingNode.node.disconnect(n);
                    }
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
});
