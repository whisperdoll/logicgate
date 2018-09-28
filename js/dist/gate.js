var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Gate = (function () {
    function Gate() {
    }
    return Gate;
}());
var OpGate = (function (_super) {
    __extends(OpGate, _super);
    function OpGate() {
        var _this = _super.call(this) || this;
        _this.inputNodes =
            [
                new IONode("input1"),
                new IONode("input2")
            ];
        _this.inputNodes[0].onvalueset = _this.nodeFn.bind(_this);
        _this.inputNodes[1].onvalueset = _this.nodeFn.bind(_this);
        _this.outputNodes =
            [
                new IONode("output")
            ];
        return _this;
    }
    OpGate.prototype.nodeFn = function () {
        if (this.inputNodes[0].value !== -1 && this.inputNodes[1].value !== -1) {
            this.outputNodes[0].value = this.gateFn();
        }
    };
    OpGate.prototype.gateFn = function () {
        return -1;
    };
    return OpGate;
}(Gate));
var ANDGate = (function (_super) {
    __extends(ANDGate, _super);
    function ANDGate() {
        return _super.call(this) || this;
    }
    ANDGate.prototype.gateFn = function () {
        return this.inputNodes[0].value & this.inputNodes[1].value;
    };
    return ANDGate;
}(OpGate));
var ORGate = (function (_super) {
    __extends(ORGate, _super);
    function ORGate() {
        return _super.call(this) || this;
    }
    ORGate.prototype.gateFn = function () {
        return this.inputNodes[0].value | this.inputNodes[1].value;
    };
    return ORGate;
}(OpGate));
var XORGate = (function (_super) {
    __extends(XORGate, _super);
    function XORGate() {
        return _super.call(this) || this;
    }
    XORGate.prototype.gateFn = function () {
        return this.inputNodes[0].value ^ this.inputNodes[1].value;
    };
    return XORGate;
}(OpGate));
