export interface OutputConnection
{
    outputIndex : number;
    connectingToId : number;
    connectingToInputIndex: number;
}

export interface SerializedObject
{
    type : string;
    id : number;
    label : string;
    x : number;
    y : number;
    outputConnections : OutputConnection[];
}

export interface SerializedCircuit
{
    type : string,
    label : string,
    id : number,
    components : SerializedObject[]
}