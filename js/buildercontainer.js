define(["require", "exports", "./builder", "./canvas", "./buildergatelist", "./buildertoolbar"], function (require, exports, builder_1, canvas_1, buildergatelist_1, buildertoolbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BuilderContainer = (function () {
        function BuilderContainer(parent, resX, resY) {
            this.parent = parent;
            this.container = document.createElement("div");
            this.container.className = "container-builder";
            this.builder = null;
            this.gateList = new buildergatelist_1.GateList(this);
            this.toolbar = new buildertoolbar_1.Toolbar(this);
            this.resX = resX;
            this.resY = resY;
            this.overlay = new canvas_1.Canvas({ width: resX * (100 / (100 - 15)), height: resY });
            this.overlay.canvas.className = "overlay";
            this.container.appendChild(this.overlay.canvas);
            this.overlay.mouse.addEventListener("move", this.mouseMove.bind(this));
            this.overlay.mouse.addEventListener("up", this.mouseUp.bind(this));
            parent.container.appendChild(this.container);
            this.hideOverlay();
            window.requestAnimationFrame(this.drawReq.bind(this));
            this.parent.container.appendChild(this.container);
        }
        BuilderContainer.prototype.loadGate = function (gate) {
            this.builder = new builder_1.Builder(this, gate.clone(), this.resX, this.resY);
            this.container.removeChild(this.toolbar.container);
            this.toolbar = new buildertoolbar_1.Toolbar(this, gate.type === "sandbox");
        };
        BuilderContainer.prototype.showOverlay = function () {
            this.overlay.canvas.style["z-index"] = 1;
        };
        BuilderContainer.prototype.hideOverlay = function () {
            this.overlay.canvas.style["z-index"] = -1;
        };
        BuilderContainer.prototype.mouseUp = function (x, y, ox, oy, e) {
            var gate = this.builder.movingGate;
            this.builder.mouseUp.call(this.builder, x, y, ox, oy, e);
            if (x > this.overlay.width * (1 - 0.15)) {
                this.builder.removeGate(gate);
            }
            if (y > this.resY) {
                gate.y = this.resY - gate.height;
            }
            this.hideOverlay();
        };
        BuilderContainer.prototype.mouseMove = function (x, y, mouseDown, lx, ly, ox, oy, e) {
            this.builder.mouseMove.call(this.builder, x, y, mouseDown, lx, ly, ox, oy, e);
        };
        BuilderContainer.prototype.draw = function () {
            if (!this.builder)
                return;
            this.overlay.clear();
            if (this.builder.movingGate) {
                if (this.builder.mouse.x > this.overlay.width * (1 - 0.15)) {
                    this.overlay.fillRect(this.overlay.width * (1 - 0.15), 0, this.overlay.width * 0.15, this.overlay.height, "rgba(255,0,0,0.3)");
                }
            }
            this.builder.draw();
        };
        BuilderContainer.prototype.drawReq = function () {
            this.draw();
            window.requestAnimationFrame(this.drawReq.bind(this));
        };
        Object.defineProperty(BuilderContainer.prototype, "size", {
            get: function () {
                var c = this.container.getBoundingClientRect();
                return { width: c.width, height: c.height };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BuilderContainer.prototype, "innerSize", {
            get: function () {
                return { width: this.container.offsetWidth, height: this.container.offsetHeight };
            },
            enumerable: true,
            configurable: true
        });
        return BuilderContainer;
    }());
    exports.BuilderContainer = BuilderContainer;
});
