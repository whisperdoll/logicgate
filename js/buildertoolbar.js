define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Toolbar = (function () {
        function Toolbar(parent, sandbox) {
            if (sandbox === void 0) { sandbox = true; }
            var _this = this;
            this.container = document.createElement("div");
            this.container.className = "toolbar";
            this.parent = parent;
            parent.container.appendChild(this.container);
            this.makeButton("img/back.png", "Back", function () {
                _this.parent.builder.exit();
            });
            if (!sandbox) {
                this.makeButton("img/play.png", "Test", function () {
                    _this.parent.builder.test();
                });
            }
            else {
                this.makeButton("img/minus.png", "Input", function () {
                    _this.parent.builder.removeLastInputNode();
                });
                this.makeButton("img/plus.png", "Input", function () {
                    var inputNo = _this.parent.builder.circuit.numInputs + 1;
                    _this.parent.builder.addNode("input" + inputNo.toString(), true);
                });
                this.makeButton("img/minus.png", "Output", function () {
                    _this.parent.builder.removeLastOutputNode();
                });
                this.makeButton("img/plus.png", "Output", function () {
                    var outputNo = _this.parent.builder.circuit.numOutputs + 1;
                    _this.parent.builder.addNode("output" + outputNo.toString(), false);
                });
            }
            this.makeButton("img/save.png", "Save", function () {
                _this.parent.builder.save();
            });
            this.makeButton("img/info.png", "Info", function () {
                _this.parent.builder.gateInfoWidget.show();
            });
            this.makeButton("img/truthtable.png", "TrthTbl", function () {
                _this.parent.builder.truthTableWidget.show();
            });
        }
        Toolbar.prototype.makeButton = function (imgSrc, text, onclick) {
            var c = document.createElement("div");
            c.className = "toolbar-button";
            var i = document.createElement("img");
            i.src = imgSrc;
            c.appendChild(i);
            var l = document.createElement("div");
            l.innerText = text;
            c.appendChild(l);
            c.addEventListener("click", onclick);
            this.container.appendChild(c);
        };
        return Toolbar;
    }());
    exports.Toolbar = Toolbar;
});
