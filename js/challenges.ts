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
        description: "Outputs the sum and carry of <b>A</b> and <b>B</b>.<br>Carry is set if the sum rolls over."
    }
};

export default challenges;