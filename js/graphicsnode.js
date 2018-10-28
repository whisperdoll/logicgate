define(["require", "exports", "./ionode", "./utils"], function (require, exports, ionode_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GraphicsNode = (function () {
        function GraphicsNode(parent, node) {
            this.x = 0;
            this.y = 0;
            this.size = 32;
            this.parent = parent;
            this.node = node;
        }
        Object.defineProperty(GraphicsNode.prototype, "id", {
            get: function () {
                return this.node.id;
            },
            set: function (id) {
                this.node.id = id;
            },
            enumerable: true,
            configurable: true
        });
        GraphicsNode.prototype.draw = function (canvas) {
            canvas.fillCircleInSquare(this.x, this.y, this.size, this.node.color);
            canvas.drawCircleInSquare(this.x, this.y, this.size, "#333333", 2);
            if (this.node.value !== ionode_1.IONode.NO_VALUE) {
                canvas.fillText(this.node.value, this.cx, this.cy, "#333333", "middle", "center", "16px monospace");
            }
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
});
