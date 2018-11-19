define(["require", "exports", "./utils", "./ui"], function (require, exports, utils_1, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Landing = (function () {
        function Landing(parent) {
            var _this = this;
            this.parent = parent;
            this.container = utils_1.createElement("div", "container-landing");
            var header = utils_1.createElement("h1", "landing-header");
            header.innerText = "logic;gate";
            this.container.appendChild(header);
            var sandboxBtn = utils_1.createElement("button", "landing-button");
            sandboxBtn.innerText = "sandbox";
            sandboxBtn.addEventListener("click", function () {
                _this.parent.show(ui_1.UI.SANDBOX);
            });
            this.container.appendChild(sandboxBtn);
            var challengesBtn = utils_1.createElement("button", "landing-button");
            challengesBtn.innerText = "challenges";
            challengesBtn.addEventListener("click", function () {
                _this.parent.show(ui_1.UI.CHALLENGES);
            });
            this.container.appendChild(challengesBtn);
            this.parent.container.appendChild(this.container);
        }
        return Landing;
    }());
    exports.Landing = Landing;
});
