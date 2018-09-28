define(["require", "exports", "./canvas", "./utils"], function (require, exports, canvas_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Builder = (function () {
        function Builder(parent, width, height) {
            this.gates = [];
            this.mouse = { x: 0, y: 0 };
            this.parent = parent;
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
        }
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
        Builder.prototype.gateWithNode = function (node) {
            return this.gates.find(function (gate) { return gate.gate.outputNodes.indexOf(node) !== -1 || gate.gate.inputNodes.indexOf(node) !== -1; });
        };
        Builder.prototype.draw = function () {
            var _this = this;
            this.canvas.clear();
            var padding = 32;
            this.canvas.fillRect(padding, padding, this.width - padding * 2, this.height - padding * 2, "rgba(255,255,255,1)");
            this.gates.forEach(function (gate) { return gate.draw(_this.canvas); });
            this.drawConnections();
            if (this.hovering) {
                this.hovering.draw(this.movingGate ? this.parent.overlay : this.canvas);
            }
            if (this.connectingGate) {
                var opt = this.connectingGate.nodePoint(this.connectingOutput, false, true);
                this.canvas.drawLine(opt.x, opt.y, this.mouse.x, this.mouse.y, "red", 2);
            }
        };
        Builder.prototype.drawConnections = function () {
            var _this = this;
            this.gates.forEach(function (gate) {
                gate.gate.outputNodes.forEach(function (node, i) {
                    var opt = gate.nodePoint(i, false, true);
                    node.outputNodes.forEach(function (inputNode, j) {
                        var gwn = _this.gateWithNode(inputNode);
                        var ipt = gwn.nodePoint(gwn.gate.inputNodes.indexOf(inputNode), true, true);
                        _this.canvas.drawLine(opt.x, opt.y, ipt.x, ipt.y, "red", 2);
                    });
                });
            });
        };
        Builder.prototype.addGate = function (gate) {
            var g = new GraphicsGate(gate);
            this.gates.push(g);
            return g;
        };
        Builder.prototype.removeGate = function (gate) {
            gate.gate.inputNodes.forEach(function (node) {
                node.inputNode && node.inputNode.disconnect(node);
            });
            gate.gate.outputNodes.forEach(function (node) {
                node.outputNodes.forEach(function (onode) {
                    node.disconnect(onode);
                });
            });
            this.gates.splice(this.gates.indexOf(gate), 1);
        };
        Builder.prototype.mouseDown = function (x, y, e) {
            e.preventDefault();
            var hoveredGate = this.hoveredGate();
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
            else {
                var hoveredGate = this.hoveredGate();
                if (hoveredGate) {
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
            if (this.connectingGate) {
                var h = this.hoveredGate();
                if (h && h !== this.connectingGate) {
                    this.connectingGate.connect(this.connectingOutput, h, h.getConnectingInput(y));
                }
            }
            this.connectingGate = null;
        };
        Builder.prototype.hoveredGate = function () {
            var _this = this;
            if (this.hovering) {
                this.hovering.hovered = false;
            }
            var gates = this.gates.filter(function (gate) { return gate.containsPoint(_this.mouse.x, _this.mouse.y); });
            var ret = gates[gates.length - 1] || null;
            if (ret) {
                ret.hovered = true;
            }
            this.hovering = ret;
            return ret;
        };
        return Builder;
    }());
    exports.Builder = Builder;
    var GraphicsGate = (function () {
        function GraphicsGate(gate) {
            this.x = 0;
            this.y = 0;
            this.width = 64;
            this.height = 24;
            this.color = "#fff";
            this.nodeSize = 12;
            this.nodePadding = 8;
            this.hovered = false;
            this.gate = gate;
            var nodes = Math.max(gate.inputNodes.length, gate.outputNodes.length);
            this.height = nodes * this.nodeSize + (nodes + 1) * this.nodePadding;
        }
        GraphicsGate.prototype.draw = function (canvas) {
            this.drawNodes(canvas, true);
            this.drawNodes(canvas, false);
            canvas.fillRect(this.x, this.y, this.width, this.height, this.color);
            canvas.drawRect(this.x, this.y, this.width, this.height, "black", 3, true);
            canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "black", "middle", "center", "24px monospace");
        };
        GraphicsGate.prototype.drawNodes = function (canvas, input) {
            var nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
            for (var i = 0; i < nodeList.length; i++) {
                var pt = this.nodePoint(i, input);
                var node = nodeList[i];
                canvas.drawRect(pt.x, pt.y, this.nodeSize, this.nodeSize, "black", 1, true);
                if (this.hovered) {
                    var fontSize = 14;
                    canvas.fillText(node.label, pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2), pt.y + this.nodeSize / 2, "black", "middle", input ? "right" : "left", fontSize + "px monospace");
                }
            }
        };
        GraphicsGate.prototype.nodePoint = function (index, input, corrected) {
            if (corrected === undefined)
                corrected = false;
            var nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
            var padding = (this.height - nodeList.length * this.nodeSize) / (nodeList.length + 1);
            return {
                x: this.x - (corrected ? 0 : this.nodeSize / 2) + (input ? 0 : this.width),
                y: this.y + padding * (index + 1) + this.nodeSize * index + (corrected ? this.nodeSize / 2 : 0)
            };
        };
        GraphicsGate.prototype.containsPoint = function (x, y) {
            return utils_1.pointInRect(x, y, this.x - this.nodeSize, this.y, this.width + this.nodeSize * 2, this.height);
        };
        GraphicsGate.prototype.nodeIndexFromY = function (y, input) {
            var slices = this.gate[input ? "inputNodes" : "outputNodes"].length;
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
            var inputNode = gate.gate.inputNodes[input];
            var o = this.gate.outputNodes[output].connect(inputNode);
            if (o.success) {
                return o.oustedNode;
            }
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
        GateList.prototype.createGateElement = function (gateClass) {
            var _this = this;
            var g = new GraphicsGate((new gateClass()));
            var c = new canvas_1.Canvas({ width: g.width + g.nodeSize * 2, height: g.height + 8 });
            g.x = g.nodeSize;
            g.y = 4;
            g.draw(c);
            var container = document.createElement("div");
            container.className = "gate";
            container.appendChild(c.canvas);
            c.mouse.addEventListener("down", function (x, y, e) {
                _this.spawnGate((new gateClass()), x, y, e);
            });
            return container;
        };
        GateList.prototype.appendChild = function (element) {
            this.element.appendChild(element);
            this.children.push(element);
        };
        GateList.prototype.appendGateElement = function (gateClass) {
            this.appendChild(this.createGateElement(gateClass));
        };
        GateList.prototype.spawnGate = function (gate, x, y, e) {
            var g = this.parent.builder.addGate(gate);
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
            this.container = document.createElement("div");
            this.container.className = "toolbar";
            this.parent = parent;
            parent.container.appendChild(this.container);
        }
        return Toolbar;
    }());
    exports.Toolbar = Toolbar;
    var BuilderContainer = (function () {
        function BuilderContainer(parent, resX, resY) {
            this.container = document.createElement("div");
            this.container.className = "container-builder";
            this.builder = new Builder(this, resX, resY);
            this.gateList = new GateList(this);
            this.toolbar = new Toolbar(this);
            this.overlay = new canvas_1.Canvas({ width: resX * (10 / 9), height: resY });
            this.overlay.canvas.className = "overlay";
            this.container.appendChild(this.overlay.canvas);
            this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
            this.overlay.mouse.addEventListener("up", this.mouseUp.bind(this));
            parent.appendChild(this.container);
            this.hideOverlay();
            window.requestAnimationFrame(this.drawReq.bind(this));
        }
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
            this.hideOverlay();
        };
        BuilderContainer.prototype.mouseMove = function (x, y, mouseDown, lx, ly, ox, oy, e) {
            this.builder.mouseMove.call(this.builder, x, y, mouseDown, lx, ly, ox, oy, e);
        };
        BuilderContainer.prototype.draw = function () {
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
        return BuilderContainer;
    }());
    exports.BuilderContainer = BuilderContainer;
});
