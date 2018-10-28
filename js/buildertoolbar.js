define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Toolbar = (function () {
        function Toolbar(parent) {
            var _this = this;
            this.container = document.createElement("div");
            this.container.className = "toolbar";
            this.parent = parent;
            parent.container.appendChild(this.container);
            this.makeButton("img/back.png", "Back", function () {
                _this.parent.builder.exit();
            });
            this.makeButton("img/play.png", "Test", function () {
                _this.parent.builder.test();
            });
            this.makeButton("img/save.png", "Save", function () {
                _this.parent.builder.save();
            });
            this.makeButton("img/info.png", "Info", function () {
                _this.parent.builder.gateInfoWidget.show();
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
