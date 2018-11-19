define(["require", "exports", "./challenges", "./graphicsgate", "./gate", "./ui"], function (require, exports, challenges_1, graphicsgate_1, gate_1, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChallengeContainer = (function () {
        function ChallengeContainer(parent) {
            var _this = this;
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-challenges";
            this.gateContainer = document.createElement("div");
            this.gateContainer.className = "container-challenges-gates";
            this.headerContainer = document.createElement("div");
            this.headerContainer.className = "container-challenges-header";
            var s = document.createElement("div");
            s.className = "challenges-title";
            s.innerText = "Challenges";
            this.headerContainer.appendChild(s);
            var b = document.createElement("i");
            b.className = "challenges-back fas fa-arrow-left";
            b.innerHTML = "<span>&nbsp;&nbsp;Back</span>";
            b.addEventListener("click", function () { return _this.parent.show(ui_1.UI.LANDING); });
            this.headerContainer.appendChild(b);
            this.parent.container.appendChild(this.container);
            this.container.appendChild(this.headerContainer);
            this.container.appendChild(this.gateContainer);
        }
        ChallengeContainer.prototype.addChallenge = function (challenge) {
            var _this = this;
            var g = new graphicsgate_1.GraphicsGate(this.parent.builderContainer, new gate_1.ShallowGate(challenge.label, challenge.inputs.length, challenge.outputs.length));
            if (challenge.solved) {
                g.color = "#CCFFCC";
            }
            else {
                g.color = "#FFCCCC";
            }
            var e = g.toHTMLElement();
            e.addEventListener("click", function () {
                _this.parent.builderContainer.loadGate(gate_1.CircuitGate.ofType(challenge.type));
                _this.parent.show(ui_1.UI.BUILDER);
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
