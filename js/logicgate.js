define(["require", "exports", "./ui"], function (require, exports, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var container = document.getElementById("container");
    var ui = new ui_1.UI(container, 864, 486);
    window["b"] = ui;
    var l = ui.builderContainer.gateList;
});
