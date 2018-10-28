define(["require", "exports", "./utils", "./canvas"], function (require, exports, utils_1, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            canvas.drawRoundedRect(this.x, this.y, this.width, this.height, 5, "#333333", 2, false);
            canvas.fillText(this.gate.label, this.x + this.width / 2, this.y + this.height / 2, "#333333", "middle", "center", "24px monospace");
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
                canvas.drawRoundedRect(pt.x, pt.y, _this.nodeSize, _this.nodeSize, 3, "#333333", 2, false);
                if (drawLabels) {
                    var fontSize = 14;
                    var fontSize2 = fontSize + 2;
                    canvas.fillText(node.label, pt.x + (input ? -_this.nodeSize / 2 : _this.nodeSize + _this.nodeSize / 2), pt.y + _this.nodeSize / 2, "white", "middle", input ? "right" : "left", fontSize + "px monospace");
                    canvas.fillText(node.label, pt.x + (input ? -_this.nodeSize / 2 : _this.nodeSize + _this.nodeSize / 2), pt.y + _this.nodeSize / 2, "#333333", "middle", input ? "right" : "left", fontSize + "px monospace");
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
});
