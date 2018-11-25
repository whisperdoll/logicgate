define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Toolbar = (function () {
        function Toolbar(parent, sandbox) {
            if (sandbox === void 0) { sandbox = true; }
            this.container = document.createElement("div");
            this.container.className = "toolbar";
            this.parent = parent;
            parent.container.appendChild(this.container);
            this.makeButton("arrow-left", "Back", this.buttonPress_exit);
            if (!sandbox) {
                this.makeButton("play", "Test", this.buttonPress_play);
                this.makeButton("info", "Info", this.buttonPress_info);
                this.makeButton("save", "Save", this.buttonPress_save);
            }
            else {
                this.makeButton("minus", "Input", this.buttonPress_removeInput);
                this.makeButton("plus", "Input", this.buttonPress_addInput);
                this.makeButton("minus", "Output", this.buttonPress_removeOutput);
                this.makeButton("plus", "Output", this.buttonPress_addOutput);
            }
            this.makeButton("table", "TrthTbl", this.buttonPress_truthTable);
        }
        Toolbar.prototype.makeButton = function (icon, text, onclick) {
            var c = document.createElement("div");
            c.className = "toolbar-button";
            var i = document.createElement("i");
            i.className = "fas fa-" + icon;
            c.appendChild(i);
            var l = document.createElement("div");
            l.innerText = text;
            c.appendChild(l);
            c.addEventListener("click", onclick.bind(this));
            this.container.appendChild(c);
        };
        Toolbar.prototype.buttonPress_addInput = function () {
            var inputNo = this.parent.builder.circuit.numInputs + 1;
            this.parent.builder.addNode("input" + inputNo.toString(), true);
        };
        Toolbar.prototype.buttonPress_removeInput = function () {
            if (this.parent.builder.circuit.numInputs > 1) {
                this.parent.builder.removeLastInputNode();
            }
        };
        Toolbar.prototype.buttonPress_addOutput = function () {
            var outputNo = this.parent.builder.circuit.numOutputs + 1;
            this.parent.builder.addNode("output" + outputNo.toString(), false);
        };
        Toolbar.prototype.buttonPress_removeOutput = function () {
            if (this.parent.builder.circuit.numOutputs > 1) {
                this.parent.builder.removeLastOutputNode();
            }
        };
        Toolbar.prototype.buttonPress_play = function () {
            this.parent.builder.test();
        };
        Toolbar.prototype.buttonPress_exit = function () {
            this.parent.builder.exit();
        };
        Toolbar.prototype.buttonPress_save = function () {
            this.parent.builder.save();
        };
        Toolbar.prototype.buttonPress_info = function () {
            this.parent.builder.gateInfoWidget.show();
        };
        Toolbar.prototype.buttonPress_truthTable = function () {
            this.parent.builder.truthTableWidget.show();
        };
        return Toolbar;
    }());
    exports.Toolbar = Toolbar;
});
