import { Builder, GateList, BuilderContainer } from "./builder";
import { OpGate, ANDGate, ORGate, XORGate } from "./gate"
import { UI } from "./ui";

let container = document.getElementById("container");

let ui = new UI(container, 864, 486);

window["b"] = ui;

let l = ui.builderContainer.gateList;