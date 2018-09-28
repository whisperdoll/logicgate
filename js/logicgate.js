define(["require", "exports", "./builder", "./gate"], function (require, exports, builder_1, gate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var container = document.getElementById("container-builder");
    var bc = new builder_1.BuilderContainer(document.body, (1920 - 200) / (3 / 2), (1080 - 96) / (3 / 2));
    var l = bc.gateList;
    l.appendGateElement(gate_1.ANDGate);
    l.appendGateElement(gate_1.ORGate);
    l.appendGateElement(gate_1.XORGate);
});
