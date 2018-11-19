define(["require", "exports", "./gate", "./utils", "./buildercontainer", "./challengecontainer", "./landing"], function (require, exports, gate_1, utils_1, buildercontainer_1, challengecontainer_1, landing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UI = (function () {
        function UI(parent, resX, resY) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-ui";
            this.builderContainer = new buildercontainer_1.BuilderContainer(this, resX, resY);
            this.challengeContainer = new challengecontainer_1.ChallengeContainer(this);
            this.landing = new landing_1.Landing(this);
            this.parent.appendChild(this.container);
            window.addEventListener("resize", this.resize.bind(this));
            this.resize();
            gate_1.loadCircuits();
            this.show(UI.LANDING);
        }
        UI.prototype.show = function (what) {
            this.hideAll();
            switch (what) {
                case UI.BUILDER:
                    utils_1.showElement(this.builderContainer.container);
                    break;
                case UI.CHALLENGES:
                    this.challengeContainer.build();
                    utils_1.showElement(this.challengeContainer.container);
                    break;
                case UI.SANDBOX:
                    {
                        var g = new gate_1.CircuitGate("sandbox", "sandbox");
                        this.builderContainer.loadGate(g);
                        utils_1.showElement(this.builderContainer.container);
                        break;
                    }
                case UI.LANDING:
                    utils_1.showElement(this.landing.container);
                    break;
            }
        };
        UI.prototype.hideAll = function () {
            utils_1.hideElement(this.builderContainer.container);
            utils_1.hideElement(this.challengeContainer.container);
            utils_1.hideElement(this.landing.container);
        };
        Object.defineProperty(UI.prototype, "size", {
            get: function () {
                var c = this.container.getBoundingClientRect();
                return { width: c.width, height: c.height };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UI.prototype, "innerSize", {
            get: function () {
                return { width: this.container.offsetWidth, height: this.container.offsetHeight };
            },
            enumerable: true,
            configurable: true
        });
        UI.prototype.resize = function () {
            var psize = this.parent.getBoundingClientRect();
            var w = psize.width;
            var h = psize.height;
            var size = this.innerSize;
            var scaleX = w / size.width;
            var scaleY = h / size.height;
            this.container.style.transform = "scale(" + scaleX + "," + scaleY + ")";
        };
        UI.LANDING = 0;
        UI.BUILDER = 1;
        UI.CHALLENGES = 2;
        UI.SANDBOX = 3;
        return UI;
    }());
    exports.UI = UI;
});
