define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SandboxContainer = (function () {
        function SandboxContainer(parent) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-sandbox";
            this.gateContainer = document.createElement("div");
            this.gateContainer.className = "container-sandbox-gates";
            this.headerContainer = document.createElement("div");
            this.headerContainer.className = "container-sandbox-header";
            var s = document.createElement("div");
            s.className = "sandbox-title";
            s.innerText = "Sandbox";
            this.headerContainer.appendChild(s);
            this.parent.container.appendChild(this.container);
            this.container.appendChild(this.headerContainer);
            this.container.appendChild(this.gateContainer);
        }
        SandboxContainer.prototype.build = function () {
        };
        return SandboxContainer;
    }());
    exports.SandboxContainer = SandboxContainer;
});
