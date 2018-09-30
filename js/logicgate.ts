import { Builder, GateList, BuilderContainer } from "./builder";
import { OpGate, ANDGate, ORGate, XORGate } from "./gate"

let container = document.getElementById("container-builder");

let bc = new BuilderContainer(document.body, 864, 486);

window["b"] = bc;

let l = bc.gateList;
l.appendGateElement(ANDGate);
l.appendGateElement(ORGate);
l.appendGateElement(XORGate);

bc.builder.addInputNode("input1");
bc.builder.addInputNode("input2");
bc.builder.addInputNode("inputC");
bc.builder.addOutputNode("S");
bc.builder.addOutputNode("C");