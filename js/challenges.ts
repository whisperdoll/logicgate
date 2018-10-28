export interface ChallengeObject {
    type : string,
    label : string,
    inputs : string[],
    outputs : string[],
    expects : ChallengeExpectation[],
    solution : string,
    solved : boolean,
    description: string
};

export interface ChallengeExpectation {
    inputs: number[];
    outputs: number[];
}

let challenges : { [ type : string ] : ChallengeObject } =
{
    NAND: {
        type: "NAND",
        label: "NAND",
        inputs: [ "A", "B" ],
        outputs: [ "output" ],
        expects: [
            {
                inputs: [ 0, 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 0, 1 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 1, 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 1, 1 ],
                outputs: [ 0 ]
            }
        ],
        solution: "",
        solved: false,
        description: "<b>Output</b>s 0 if <b>A</b> and <b>B</b> are both 1, <b>output</b>s 1 otherwise."
    },
    NOR: {
        type: "NOR",
        label: "NOR",
        inputs: [ "A", "B" ],
        outputs: [ "output" ],
        expects: [
            {
                inputs: [ 0, 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 0, 1 ],
                outputs: [ 0 ]
            },
            {
                inputs: [ 1, 0 ],
                outputs: [ 0 ]
            },
            {
                inputs: [ 1, 1 ],
                outputs: [ 1 ]
            }
        ],
        solution: "",
        solved: false,
        description: "<b>Output</b>s 0 if either <b>A</b> or <b>B</b> are 1, <b>output</b>s 1 otherwise."
    },
    XOR: {
        type: "XOR",
        label: "XOR",
        inputs: [ "A", "B" ],
        outputs: [ "output" ],
        expects: [
            {
                inputs: [ 0, 0 ],
                outputs: [ 0 ]
            },
            {
                inputs: [ 0, 1 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 1, 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 1, 1 ],
                outputs: [ 0 ]
            }
        ],
        solution: "",
        solved: false,
        description: "<b>Output</b>s 0 if <b>A</b> and <b>B</b> are the same, <b>output</b>s 1 otherwise."
    },
    NXOR: {
        type: "NXOR",
        label: "NXOR",
        inputs: [ "A", "B" ],
        outputs: [ "output" ],
        expects: [
            {
                inputs: [ 0, 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 0, 1 ],
                outputs: [ 0 ]
            },
            {
                inputs: [ 1, 0 ],
                outputs: [ 0 ]
            },
            {
                inputs: [ 1, 1 ],
                outputs: [ 1 ]
            }
        ],
        solution: "",
        solved: false,
        description: "<b>Output</b>s 1 if <b>A</b> and <b>B</b> are the same, <b>output</b>s 0 otherwise."
    },
    HAD: {
        type: "HAD",
        label: "HAD",
        inputs: [ "A", "B" ],
        outputs: [ "Sum", "Carry" ],
        expects: [
            {
                inputs: [ 0, 0 ],
                outputs: [ 0, 0 ]
            },
            {
                inputs: [ 0, 1 ],
                outputs: [ 1, 0 ]
            },
            {
                inputs: [ 1, 0 ],
                outputs: [ 1, 0 ]
            },
            {
                inputs: [ 1, 1 ],
                outputs: [ 0, 1 ]
            }
        ],
        solution: "",
        solved: false,
        description: "Outputs the <b>sum</b> and <b>carry</b> of <b>A</b> and <b>B</b>.<br><b>Carry</b> is set if the sum rolls over."
    },
    ADD: {
        type: "ADD",
        label: "ADD",
        inputs: [ "A", "B", "CarryIn" ],
        outputs: [ "Sum", "CarryOut" ],
        expects: [
            {
                inputs: [ 0, 0, 0 ],
                outputs: [ 0, 0 ]
            },
            {
                inputs: [ 0, 0, 1 ],
                outputs: [ 1, 0 ]
            },
            {
                inputs: [ 0, 1, 0 ],
                outputs: [ 1, 0 ]
            },
            {
                inputs: [ 1, 0, 0 ],
                outputs: [ 1, 0 ]
            },
            {
                inputs: [ 1, 1, 0 ],
                outputs: [ 0, 1 ]
            },
            {
                inputs: [ 1, 0, 1 ],
                outputs: [ 0, 1 ]
            },
            {
                inputs: [ 0, 1, 1 ],
                outputs: [ 0, 1 ]
            },
            {
                inputs: [ 1, 1, 1 ],
                outputs: [ 1, 1 ]
            },
        ],
        solution: "",
        solved: false,
        description: "Outputs the <b>sum</b> and <b>carry</b> of <b>A</b>, <b>B</b>, and <b>CarryIn</b>.<br><b>CarryOut</b> is set if the sum rolls over."
    }
};

export default challenges;