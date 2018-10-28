define(["require", "exports", "./gate", "./challenges", "./canvas", "./graphicsgate"], function (require, exports, gate_1, challenges_1, canvas_1, graphicsgate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
            for (var type in challenges_1.default) {
                var c = challenges_1.default[type];
                var t = gate_1.CircuitGate.ofType(c.type);
                var forbid = t.gateTypesUsed;
                if (c.solved && c.type !== circuitType && !forbid.has(circuitType)) {
                    this.appendGateElement(t);
                }
            }
        };
        GateList.prototype.createGateElement = function (gate) {
            var _this = this;
            var g = new graphicsgate_1.GraphicsGate(this.parent, gate.clone());
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
});
