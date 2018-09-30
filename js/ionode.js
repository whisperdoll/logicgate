define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IONode = (function () {
        function IONode(label) {
            this.inputNode = null;
            this.label = label;
            this._value = -1;
            this.outputNodes = [];
        }
        Object.defineProperty(IONode.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                var _this = this;
                this._value = value & 1;
                this.onvalueset && this.onvalueset(this._value);
                this.outputNodes.forEach(function (node) { return node.value = _this._value; });
            },
            enumerable: true,
            configurable: true
        });
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
        return IONode;
    }());
    exports.IONode = IONode;
});
