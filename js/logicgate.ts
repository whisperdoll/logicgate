import { Builder, GateList, BuilderContainer } from "./builder";
import { OpGate, ANDGate, ORGate, XORGate } from "./gate"

let container = document.getElementById("container-builder");

let bc = new BuilderContainer(document.body, (1920 - 200) / (3/2), (1080 - 96) / (3/2));

let l = bc.gateList;
l.appendGateElement(ANDGate);
l.appendGateElement(ORGate);
l.appendGateElement(XORGate);