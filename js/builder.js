define(["require", "exports", "./canvas", "./utils", "./ionode"], function (require, exports, canvas_1, utils_1, ionode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Builder = (function () {
        function Builder(parent, width, height) {
            this.gates = [];
            this.mouse = { x: 0, y: 0 };
            this.inputNodes = [];
            this.outputNodes = [];
            this.padding = 32;
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
        Builder.prototype.addInputNode = function (label) {
            this.inputNodes.push(new GraphicsNode(new ionode_1.IONode(label), true));
            this.organizeNodes();
        };
        Builder.prototype.addOutputNode = function (label) {
            this.outputNodes.push(new GraphicsNode(new ionode_1.IONode(label), false));
            this.organizeNodes();
        };
        Builder.prototype.organizeNodes = function () {
            var _this = this;
            var workingHeight = this.height - this.padding * 2;
            var workingWidth = this.width - this.padding * 2;
            var padding = 16;
            this.inputNodes.forEach(function (node, i) {
                node.x = _this.padding + padding;
                node.cy = _this.padding + (workingHeight / (_this.inputNodes.length + 1)) * (i + 1);
            });
            this.outputNodes.forEach(function (node, i) {
                node.x = _this.padding + workingWidth - padding - node.size;
                node.cy = _this.padding + (workingHeight / (_this.outputNodes.length + 1)) * (i + 1);
            });
        };
        Builder.prototype.gateWithNode = function (node) {
            return this.gates.find(function (gate) { return gate.gate.outputNodes.indexOf(node) !== -1 || gate.gate.inputNodes.indexOf(node) !== -1; });
        };
        Builder.prototype.draw = function () {
            var _this = this;
            this.canvas.clear();
            this.canvas.fill("rgba(0,0,0,0.5)");
            this.canvas.fillRoundedRect(this.padding, this.padding, this.width - this.padding * 2, this.height - this.padding * 2, 20, "rgba(255,255,255,0.5)");
            this.inputNodes.forEach(function (node) { return node.draw(_this.canvas); });
            this.outputNodes.forEach(function (node) { return node.draw(_this.canvas); });
            this.gates.forEach(function (gate) { return gate.drawGate(_this.canvas); });
            this.gates.forEach(function (gate) { return gate.drawNodes(_this.canvas, false); });
            this.gates.forEach(function (gate) { return gate.drawNodes(_this.canvas, true); });
            this.drawConnections();
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
            this.gates.forEach(function (gate) {
                gate.gate.outputNodes.forEach(function (node, i) {
                    var opt = gate.nodePoint(i, false, true);
                    node.outputNodes.forEach(function (inputNode, j) {
                        var ipt = _this.nodePoint(inputNode);
                        _this.drawLine(opt.x, opt.y, ipt.x, ipt.y, gate.colorIndex);
                    });
                });
            });
            this.inputNodes.forEach(function (node) {
                node.node.outputNodes.forEach(function (inputNode, i) {
                    var ipt = _this.nodePoint(inputNode);
                    _this.drawLine(node.cx, node.cy, ipt.x, ipt.y, node.colorIndex);
                });
            });
        };
        Builder.prototype.nodePoint = function (node) {
            var match;
            if (match = this.inputNodes.find(function (n) { return n.node === node; }) || this.outputNodes.find(function (n) { return n.node === node; })) {
                return { x: match.cx, y: match.cy };
            }
            else if (match = this.gateWithNode(node)) {
                return match.nodePoint(match.gate.inputNodes.indexOf(node), true, true);
            }
            else {
                throw "cant find the node ://";
            }
        };
        Builder.prototype.drawLine = function (x1, y1, x2, y2, colorIndex) {
            this.canvas.drawLine(x1, y1, x2, y2, Builder.Colors[colorIndex], 2);
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
            else if (n = this.inputNodes.find(function (node) { return node.containsPoint(x, y); })) {
                this.connectingNode = n;
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
                if (hoveredGate || this.inputNodes.some(function (node) { return node.containsPoint(x, y); }) || this.outputNodes.some(function (node) { return node.containsPoint(x, y); })) {
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
                else if (n = this.outputNodes.find(function (node) { return node.containsPoint(x, y); })) {
                    this.connectingGate.connectNode(this.connectingOutput, n);
                }
            }
            else if (this.connectingNode) {
                var h = this.hoveredGate();
                if (h) {
                    this.connectingNode.node.connect(h.gate.inputNodes[h.getConnectingInput(y)]);
                }
                else if (n = this.outputNodes.find(function (node) { return node.containsPoint(x, y); })) {
                    this.connectingNode.node.connect(n.node);
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
            var gates = this.gates.filter(function (gate) { return gate.containsPoint(_this.mouse.x, _this.mouse.y); });
            var ret = gates[gates.length - 1] || null;
            if (ret) {
                ret.hovered = true;
            }
            this.hovering = ret;
            return ret;
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
        function GraphicsNode(node, isInput) {
            this.x = 0;
            this.y = 0;
            this.size = 32;
            this.node = node;
            this.input = isInput;
            this.colorIndex = Builder.ColorIndex++;
        }
        GraphicsNode.prototype.draw = function (canvas) {
            canvas.fillCircleInSquare(this.x, this.y, this.size, "white");
            canvas.drawCircleInSquare(this.x, this.y, this.size, "black", 2);
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
            this.colorIndex = Builder.ColorIndex++;
        }
        GraphicsGate.prototype.drawGate = function (canvas) {
            canvas.fillRoundedRect(this.x, this.y, this.width, this.height, 5, this.color, false);
            canvas.drawRoundedRect(this.x, this.y, this.width, this.height, 5, "black", 2, false);
            canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "black", "middle", "center", "24px monospace");
        };
        GraphicsGate.prototype.drawNodes = function (canvas, input) {
            var nodeList = input ? this.gate.inputNodes : this.gate.outputNodes;
            for (var i = 0; i < nodeList.length; i++) {
                var pt = this.nodePoint(i, input);
                var node = nodeList[i];
                canvas.fillRoundedRect(pt.x, pt.y, this.nodeSize, this.nodeSize, 5, this.color, false);
                canvas.drawRoundedRect(pt.x, pt.y, this.nodeSize, this.nodeSize, 3, "black", 2, false);
                if (this.hovered) {
                    var fontSize = 14;
                    var fontSize2 = fontSize + 2;
                    canvas.fillText(node.label, pt.x + (input ? -this.nodeSize / 2 : this.nodeSize + this.nodeSize / 2), pt.y + this.nodeSize / 2, "white", "middle", input ? "right" : "left", fontSize + "px monospace");
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
            var srcNode = this.gate.outputNodes[output];
            var inputNode = gate.gate.inputNodes[input];
            var o = srcNode.connect(inputNode);
            if (o.success) {
                return o.oustedNode;
            }
            else {
                srcNode.disconnect(inputNode);
                return null;
            }
        };
        GraphicsGate.prototype.connectNode = function (output, node) {
            var srcNode = this.gate.outputNodes[output];
            var inputNode = node.node;
            var o = srcNode.connect(inputNode);
            if (o.success) {
                return o.oustedNode;
            }
            else {
                srcNode.disconnect(inputNode);
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
            g.drawGate(c);
            g.drawNodes(c, true);
            g.drawNodes(c, false);
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
            this.makeButton("img/play.png", "Run", function () { });
            this.makeButton("img/step.png", "Step", function () { });
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
            window.addEventListener("resize", this.resize.bind(this));
            this.resize();
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
        BuilderContainer.prototype.resize = function () {
            var psize = this.parent.getBoundingClientRect();
            var w = psize.width;
            var h = psize.height;
            var size = this.innerSize;
            var scaleX = w / size.width;
            var scaleY = h / size.height;
            this.container.style.transform = "scale(" + scaleX + "," + scaleY + ")";
        };
        return BuilderContainer;
    }());
    exports.BuilderContainer = BuilderContainer;
});
