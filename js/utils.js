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
    function createElement(type, className) {
        if (className === void 0) { className = ""; }
        var ret = document.createElement(type);
        ret.className = className;
        return ret;
    }
    exports.createElement = createElement;
    function numberToBinaryArray(n, numBits) {
        var ret = [];
        do {
            var bit = n & 1;
            ret.unshift(bit);
            n >>= 1;
        } while (n > 0 && ret.length < numBits);
        while (ret.length < numBits) {
            ret.unshift(0);
        }
        return ret;
    }
    function inputCombos(length) {
        var ret = [];
        var iterations = length * length;
        for (var i = 0; i < iterations; i++) {
            ret.push(numberToBinaryArray(i, length));
        }
        return ret;
    }
    exports.inputCombos = inputCombos;
});
