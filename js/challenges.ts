export interface ChallengeObject {
    type : string,
    label : string,
    inputs : string[],
    outputs : string[],
    expects : { inputs : number[], outputs : number[] }[],
    solution : string,
    solved : boolean
};

let challenges : { [ type : string ] : ChallengeObject } =
{
    HAD: {
        type: "HAD",
        label: "HAD",
        inputs: [ "A", "B" ],
        outputs: [ "S", "C" ],
        expects: [
            {
                inputs: [ 0, 1 ],
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
                outputs: [ 1, 1 ]
            }
        ],
        solution: "",
        solved: false
    }
};

export default challenges;