var IONode = (function () {
    function IONode(label) {
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
    return IONode;
}());
