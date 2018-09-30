define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pointInRect(px, py, x, y, w, h) {
        return !(px <= x || px >= x + w || py <= y || py >= y + h);
    }
    exports.pointInRect = pointInRect;
});
