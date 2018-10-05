import { Builder, GateList, BuilderContainer } from "./builder";
import { OpGate, ANDGate, ORGate, XORGate } from "./gate"
import { UI } from "./ui";

let container = document.getElementById("container-builder");

let ui = new UI(document.body, 864, 486);

window["b"] = ui;

let l = ui.builderContainer.gateList;
l.appendGateElement(ANDGate);
l.appendGateElement(ORGate);
l.appendGateElement(XORGate);

ui.builderContainer.builder.addInputNode("input1");
ui.builderContainer.builder.addInputNode("input2");
ui.builderContainer.builder.addInputNode("inputC");
ui.builderContainer.builder.addOutputNode("S");
ui.builderContainer.builder.addOutputNode("C");