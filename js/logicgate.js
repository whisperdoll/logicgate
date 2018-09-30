define(["require", "exports", "./builder", "./gate"], function (require, exports, builder_1, gate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var container = document.getElementById("container-builder");
    var bc = new builder_1.BuilderContainer(document.body, 864, 486);
    window["b"] = bc;
    var l = bc.gateList;
    l.appendGateElement(gate_1.ANDGate);
    l.appendGateElement(gate_1.ORGate);
    l.appendGateElement(gate_1.XORGate);
    bc.builder.addInputNode("input1");
    bc.builder.addInputNode("input2");
    bc.builder.addInputNode("inputC");
    bc.builder.addOutputNode("S");
    bc.builder.addOutputNode("C");
});
