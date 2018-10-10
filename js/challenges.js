define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    var challenges = {
        HAD: {
            type: "HAD",
            label: "HAD",
            inputs: ["A", "B"],
            outputs: ["S", "C"],
            expects: [
                {
                    inputs: [0, 0],
                    outputs: [0, 0]
                },
                {
                    inputs: [0, 1],
                    outputs: [1, 0]
                },
                {
                    inputs: [1, 0],
                    outputs: [1, 0]
                },
                {
                    inputs: [1, 1],
                    outputs: [1, 1]
                }
            ],
            solution: "",
            solved: false
        }
    };
    exports.default = challenges;
});
