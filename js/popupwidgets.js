var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./challenges", "./utils", "./canvas", "./graphicsgate"], function (require, exports, challenges_1, utils_1, canvas_1, graphicsgate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PopupWidget = (function () {
        function PopupWidget(parent) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "popup";
            this.container.onclick = this.hide.bind(this);
            this.innerContainer = document.createElement("div");
            this.innerContainer.className = "inner";
            this.innerContainer.onclick = function (e) { return e.stopPropagation(); };
            this.container.appendChild(this.innerContainer);
            this.okButton = document.createElement("button");
            this.okButton.className = "close";
            this.okButton.innerText = "OK";
            this.okButton.onclick = this.hide.bind(this);
            this.innerContainer.appendChild(this.okButton);
            this.parent.parent.container.appendChild(this.container);
            this.hide();
        }
        PopupWidget.prototype.hide = function () {
            utils_1.hideElement(this.container);
        };
        PopupWidget.prototype.show = function () {
            utils_1.showElement(this.container);
        };
        return PopupWidget;
    }());
    exports.PopupWidget = PopupWidget;
    var PopupMessage = (function (_super) {
        __extends(PopupMessage, _super);
        function PopupMessage(parent, title, message) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("popupMessage");
            var $title = document.createElement("h1");
            $title.innerText = title;
            $title.className = "title";
            _this.innerContainer.appendChild($title);
            var $message = document.createElement("div");
            $message.innerText = message;
            $message.className = "message";
            _this.innerContainer.appendChild($message);
            return _this;
        }
        return PopupMessage;
    }(PopupWidget));
    exports.PopupMessage = PopupMessage;
    var PopupYesNo = (function (_super) {
        __extends(PopupYesNo, _super);
        function PopupYesNo(parent, title, message, onyes, onno) {
            var _this = _super.call(this, parent, title, message) || this;
            _this.container.classList.add("popupYesNo");
            var n = _this.okButton.cloneNode();
            n.onclick = _this.okButton.onclick;
            var c = _this.okButton.cloneNode();
            c.onclick = _this.okButton.onclick;
            _this.okButton.innerText = "Yes";
            _this.okButton.classList.add("yes");
            _this.okButton.addEventListener("click", function () { return onyes(); });
            n.innerText = "No";
            n.addEventListener("click", function () { return onno(); });
            n.classList.add("no");
            _this.innerContainer.appendChild(n);
            c.innerText = "Cancel";
            c.classList.add("cancel");
            _this.innerContainer.appendChild(c);
            return _this;
        }
        return PopupYesNo;
    }(PopupMessage));
    exports.PopupYesNo = PopupYesNo;
    var TruthTableWidget = (function (_super) {
        __extends(TruthTableWidget, _super);
        function TruthTableWidget(parent) {
            var _this = _super.call(this, parent) || this;
            _this.table = utils_1.createElement("table", "truthTable");
            _this.innerContainer.appendChild(_this.table);
            return _this;
        }
        TruthTableWidget.prototype.show = function () {
            var _this = this;
            _super.prototype.show.call(this);
            this.table.innerHTML = "";
            var oldInputs = this.parent.inputArray;
            var combos = utils_1.inputCombos(oldInputs.length);
            var head = utils_1.createElement("tr");
            this.parent.circuit.forEachInput(function (input) {
                var th = utils_1.createElement("th");
                th.innerText = input.rawLabel;
                head.appendChild(th);
            });
            this.parent.circuit.forEachOutput(function (output) {
                var th = utils_1.createElement("th");
                th.innerText = output.rawLabel;
                head.appendChild(th);
            });
            this.table.appendChild(head);
            combos.forEach(function (combo) {
                _this.parent.inputArray = combo;
                var row = utils_1.createElement("tr");
                _this.parent.circuit.forEachInput(function (input) {
                    var td = utils_1.createElement("td");
                    td.innerText = input.value.toString();
                    row.appendChild(td);
                });
                _this.parent.circuit.forEachOutput(function (output) {
                    var td = utils_1.createElement("td");
                    td.innerText = output.value.toString();
                    row.appendChild(td);
                });
                _this.table.appendChild(row);
            });
            this.parent.inputArray = oldInputs;
        };
        return TruthTableWidget;
    }(PopupWidget));
    exports.TruthTableWidget = TruthTableWidget;
    var GatePanelWidget = (function (_super) {
        __extends(GatePanelWidget, _super);
        function GatePanelWidget(parent) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("gatePanelWidget");
            _this.descriptionContainer = document.createElement("div");
            _this.descriptionContainer.className = "description";
            _this.innerContainer.appendChild(_this.descriptionContainer);
            _this.panelContainer = document.createElement("div");
            _this.panelContainer.className = "panelList";
            _this.innerContainer.appendChild(_this.panelContainer);
            return _this;
        }
        GatePanelWidget.prototype.addPanel = function (e) {
            this.panelContainer.appendChild(this.makePanel(this.parent.circuit, e.inputs, e.outputs));
        };
        GatePanelWidget.prototype.makePanel = function (gate, inputs, outputs) {
            gate = gate.clone();
            if (inputs) {
                gate.forEachInput(function (node, i) { return node.value = inputs[i]; });
            }
            if (outputs) {
                gate.forEachOutput(function (node, i) { return node.value = outputs[i]; });
            }
            var gg = gate.graphicsGate || new graphicsgate_1.GraphicsGate(this.parent.parent, gate);
            var c = new canvas_1.Canvas({ width: gg.width * 4, height: gg.height });
            gg.y = 0;
            gg.x = gg.width * 1.5;
            gg.drawGate(c);
            gg.drawNodes(c, true, true);
            gg.drawNodes(c, false, true);
            var ret = document.createElement("div");
            ret.className = "panel";
            ret.appendChild(c.canvas);
            return ret;
        };
        return GatePanelWidget;
    }(PopupWidget));
    exports.GatePanelWidget = GatePanelWidget;
    var GateInfoWidget = (function (_super) {
        __extends(GateInfoWidget, _super);
        function GateInfoWidget(parent) {
            var _this = _super.call(this, parent) || this;
            if (!challenges_1.default.hasOwnProperty(_this.parent.circuit.type)) {
                return _this;
            }
            var c = challenges_1.default[_this.parent.circuit.type];
            _this.descriptionContainer.innerHTML = c.description;
            c.expects.forEach(function (e, i) {
                _this.addPanel(e);
            });
            return _this;
        }
        return GateInfoWidget;
    }(GatePanelWidget));
    exports.GateInfoWidget = GateInfoWidget;
    var GateErrorWidget = (function (_super) {
        __extends(GateErrorWidget, _super);
        function GateErrorWidget(parent) {
            var _this = _super.call(this, parent) || this;
            _this.container.classList.add("gateErrorWidget");
            _this.descriptionContainer.innerText = "There were some errors...";
            return _this;
        }
        GateErrorWidget.prototype.clear = function () {
            this.panelContainer.innerHTML = "";
        };
        GateErrorWidget.prototype.addError = function (e, given) {
            var t = this.parent.circuit.type;
            var c = challenges_1.default[t];
            this.addLabel("Expected:");
            this.addPanel(e);
            e = utils_1.cloneJSON(e);
            e.outputs = given;
            this.addLabel("Given:");
            this.addPanel(e);
            this.panelContainer.appendChild(document.createElement("hr"));
        };
        GateErrorWidget.prototype.addLabel = function (str) {
            var label = document.createElement("div");
            label.className = "label";
            label.innerText = str;
            this.panelContainer.appendChild(label);
        };
        return GateErrorWidget;
    }(GatePanelWidget));
    exports.GateErrorWidget = GateErrorWidget;
});
