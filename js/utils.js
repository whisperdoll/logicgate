define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function pointInRect(px, py, x, y, w, h) {
        return !(px <= x || px >= x + w || py <= y || py >= y + h);
    }
    exports.pointInRect = pointInRect;
    function hideElement(element) {
        element.style.display = "none";
    }
    exports.hideElement = hideElement;
    function showElement(element) {
        element.style.display = "";
    }
    exports.showElement = showElement;
    function cloneJSON(o) {
        return JSON.parse(JSON.stringify(o));
    }
    exports.cloneJSON = cloneJSON;
    function concatSet(set, otherSet) {
        otherSet.forEach(function (item) { return set.add(item); });
    }
    exports.concatSet = concatSet;
});
