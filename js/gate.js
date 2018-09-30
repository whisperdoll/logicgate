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
define(["require", "exports", "./ionode"], function (require, exports, ionode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Gate = (function () {
        function Gate() {
        }
        return Gate;
    }());
    exports.Gate = Gate;
    var OpGate = (function (_super) {
        __extends(OpGate, _super);
        function OpGate() {
            var _this = _super.call(this) || this;
            _this.inputNodes =
                [
                    new ionode_1.IONode("input1"),
                    new ionode_1.IONode("input2")
                ];
            _this.inputNodes[0].onvalueset = _this.nodeFn.bind(_this);
            _this.inputNodes[1].onvalueset = _this.nodeFn.bind(_this);
            _this.outputNodes =
                [
                    new ionode_1.IONode("output")
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
    exports.OpGate = OpGate;
    var ANDGate = (function (_super) {
        __extends(ANDGate, _super);
        function ANDGate() {
            var _this = _super.call(this) || this;
            _this.label = "AND";
            return _this;
        }
        ANDGate.prototype.gateFn = function () {
            return this.inputNodes[0].value & this.inputNodes[1].value;
        };
        return ANDGate;
    }(OpGate));
    exports.ANDGate = ANDGate;
    var ORGate = (function (_super) {
        __extends(ORGate, _super);
        function ORGate() {
            var _this = _super.call(this) || this;
            _this.label = "OR";
            return _this;
        }
        ORGate.prototype.gateFn = function () {
            return this.inputNodes[0].value | this.inputNodes[1].value;
        };
        return ORGate;
    }(OpGate));
    exports.ORGate = ORGate;
    var XORGate = (function (_super) {
        __extends(XORGate, _super);
        function XORGate() {
            var _this = _super.call(this) || this;
            _this.label = "XOR";
            return _this;
        }
        XORGate.prototype.gateFn = function () {
            return this.inputNodes[0].value ^ this.inputNodes[1].value;
        };
        return XORGate;
    }(OpGate));
    exports.XORGate = XORGate;
});
