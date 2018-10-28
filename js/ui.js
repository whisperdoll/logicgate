define(["require", "exports", "./builder", "./gate", "./utils", "./challenges"], function (require, exports, builder_1, gate_1, utils_1, challenges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UI = (function () {
        function UI(parent, resX, resY) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-ui";
            this.builderContainer = new builder_1.BuilderContainer(this, resX, resY);
            this.challengeContainer = new ChallengeContainer(this);
            this.parent.appendChild(this.container);
            window.addEventListener("resize", this.resize.bind(this));
            this.resize();
            gate_1.loadCircuits();
            this.show(UI.CHALLENGES);
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
            }
        };
        UI.prototype.hideAll = function () {
            utils_1.hideElement(this.builderContainer.container);
            utils_1.hideElement(this.challengeContainer.container);
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
        UI.BUILDER = 0;
        UI.CHALLENGES = 1;
        return UI;
    }());
    exports.UI = UI;
    var ChallengeContainer = (function () {
        function ChallengeContainer(parent) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-challenges";
            this.gateContainer = document.createElement("div");
            this.gateContainer.className = "container-challenges-gates";
            this.headerContainer = document.createElement("div");
            this.headerContainer.className = "container-challenges-header";
            var s = document.createElement("div");
            s.className = "challenges-title";
            s.innerText = "logic;gate";
            this.headerContainer.appendChild(s);
            this.parent.container.appendChild(this.container);
            this.container.appendChild(this.headerContainer);
            this.container.appendChild(this.gateContainer);
        }
        ChallengeContainer.prototype.addChallenge = function (challenge) {
            var _this = this;
            var g = new builder_1.GraphicsGate(this.parent.builderContainer, new gate_1.ShallowGate(challenge.label, challenge.inputs.length, challenge.outputs.length));
            if (challenge.solved) {
                g.color = "#CCFFCC";
            }
            else {
                g.color = "#FFCCCC";
            }
            var e = g.toHTMLElement();
            e.addEventListener("click", function () {
                _this.parent.builderContainer.editGate(gate_1.CircuitGate.ofType(challenge.type));
                _this.parent.show(UI.BUILDER);
            });
            this.gateContainer.appendChild(e);
        };
        ChallengeContainer.prototype.build = function () {
            this.gateContainer.innerHTML = "";
            for (var type in challenges_1.default) {
                this.addChallenge(challenges_1.default[type]);
            }
        };
        return ChallengeContainer;
    }());
    exports.ChallengeContainer = ChallengeContainer;
});
