define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IONode = (function () {
        function IONode(label) {
            this.inputNode = null;
            this.noValueColor = "white";
            this.graphicsNode = null;
            this.id = -1;
            this.parentGate = null;
            this.label = label;
            this._value = IONode.NO_VALUE;
            this.outputNodes = [];
        }
        Object.defineProperty(IONode.prototype, "color", {
            get: function () {
                switch (this.value) {
                    case 0: return IONode.COLOR_0;
                    case 1: return IONode.COLOR_1;
                    default: return this.noValueColor;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IONode.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value;
                this.onvalueset && this.onvalueset(this._value);
                this.propagate();
            },
            enumerable: true,
            configurable: true
        });
        IONode.prototype.propagate = function () {
            var _this = this;
            this.outputNodes.forEach(function (node) { return node.value = _this._value; });
        };
        IONode.prototype.connect = function (node) {
            var ret = {
                oustedNode: null,
                success: false
            };
            if (this.outputNodes.indexOf(node) === -1) {
                this.outputNodes.push(node);
                ret.oustedNode = node.inputNode;
                if (node.inputNode) {
                    node.inputNode.disconnect(node);
                }
                this.propagate();
                node.inputNode = this;
                ret.success = true;
            }
            return ret;
        };
        IONode.prototype.disconnect = function (node) {
            var i = this.outputNodes.indexOf(node);
            if (i !== -1) {
                this.outputNodes.splice(i, 1);
                node.inputNode = null;
            }
        };
        IONode.prototype.serialize = function (isInput) {
            var ret = {
                type: isInput ? "inputNode" : "outputNode",
                id: this.id,
                label: this.label,
                x: 0,
                y: 0,
                outputConnections: []
            };
            this.outputNodes.forEach(function (node, oi) {
                var cid;
                var cind;
                if (node.parentGate.id === -1) {
                    cid = node.id;
                    cind = -1;
                }
                else {
                    var ogate = node.parentGate;
                    cid = ogate.id;
                    cind = ogate.indexOfInput(node);
                }
                var o = {
                    outputIndex: oi,
                    connectingToId: cid,
                    connectingToInputIndex: cind
                };
                ret.outputConnections.push(o);
            });
            return ret;
        };
        IONode.NO_VALUE = -1;
        IONode.COLOR_0 = "#8888FF";
        IONode.COLOR_1 = "#FF8844";
        return IONode;
    }());
    exports.IONode = IONode;
});
