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
    NOT: {
        type: "NOT",
        label: "NOT",
        inputs: [ "input" ],
        outputs: [ "output" ],
        expects: [
            {
                inputs: [ 0 ],
                outputs: [ 1 ]
            },
            {
                inputs: [ 1 ],
                outputs: [ 0 ]
            }
        ],
        solution: "",
        solved: false,
        description: "<b>Output</b>s 0 if <b>input</b> is 1, and vice-versa."
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