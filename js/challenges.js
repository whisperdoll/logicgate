define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    var challenges = {
        HAD: {
            type: "HAD",
            label: "HAD",
            inputs: ["A", "B"],
            outputs: ["Sum", "Carry"],
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
                    outputs: [0, 1]
                }
            ],
            solution: "",
            solved: false,
            description: "Outputs the <b>sum</b> and <b>carry</b> of <b>A</b> and <b>B</b>.<br><b>Carry</b> is set if the sum rolls over."
        },
        ADD: {
            type: "ADD",
            label: "ADD",
            inputs: ["A", "B", "CarryIn"],
            outputs: ["Sum", "CarryOut"],
            expects: [
                {
                    inputs: [0, 0, 0],
                    outputs: [0, 0]
                },
                {
                    inputs: [0, 0, 1],
                    outputs: [1, 0]
                },
                {
                    inputs: [0, 1, 0],
                    outputs: [1, 0]
                },
                {
                    inputs: [1, 0, 0],
                    outputs: [1, 0]
                },
                {
                    inputs: [1, 1, 0],
                    outputs: [0, 1]
                },
                {
                    inputs: [1, 0, 1],
                    outputs: [0, 1]
                },
                {
                    inputs: [0, 1, 1],
                    outputs: [0, 1]
                },
                {
                    inputs: [1, 1, 1],
                    outputs: [1, 1]
                },
            ],
            solution: "",
            solved: false,
            description: "Outputs the <b>sum</b> and <b>carry</b> of <b>A</b>, <b>B</b>, and <b>CarryIn</b>.<br><b>CarryOut</b> is set if the sum rolls over."
        }
    };
    exports.default = challenges;
});
