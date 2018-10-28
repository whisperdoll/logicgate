define(["require", "exports", "./gate", "./ui", "./storage"], function (require, exports, gate_1, ui_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var VERSION = 3;
    if (storage_1.default.get("version", 0) < VERSION) {
        gate_1.resetCircuits();
        alert("Changes to the application were made that make your previous save data incompatible. Sorry!! But it's gone now");
    }
    storage_1.default.set("version", VERSION);
    var container = document.getElementById("container");
    var ui = new ui_1.UI(container, 960 - (960 * 0.15), 486);
    window["b"] = ui;
    var l = ui.builderContainer.gateList;
});
