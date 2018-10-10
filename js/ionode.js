define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IONode = (function () {
        function IONode(label) {
            this.inputNode = null;
            this.graphicsNode = null;
            this.id = -1;
            this.parentGate = null;
            this.label = label;
            this._value = IONode.NO_VALUE;
            this.outputNodes = [];
        }
        Object.defineProperty(IONode.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value & 1;
                this.onvalueset && this.onvalueset(this._value);
            },
            enumerable: true,
            configurable: true
        });
        IONode.prototype.propagate = function () {
            var _this = this;
            if (this.value === IONode.NO_VALUE)
                return;
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
            this.outputNodes.forEach(function (outputNode, oi) {
                var ogate = outputNode.parentGate;
                var o = {
                    outputIndex: oi,
                    connectingToId: ogate.id,
                    connectingToInputIndex: ogate.indexOfInput(outputNode)
                };
                ret.outputConnections.push(o);
            });
            return ret;
        };
        return IONode;
    }());
    exports.IONode = IONode;
});
