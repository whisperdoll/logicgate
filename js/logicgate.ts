import { OpGate, ANDGate, ORGate, resetCircuits } from "./gate"
import { UI } from "./ui";
import Storage from "./storage"

const VERSION = 5;

if (Storage.get("version", 0) < VERSION)
{
    resetCircuits();
    alert("Changes to the application were made that make your previous save data incompatible. Sorry!! But it's gone now");
}

Storage.set("version", VERSION);

let container = document.getElementById("container");

let ui = new UI(container, 960 - (960 * 0.15), 486);

window["b"] = ui;

let l = ui.builderContainer.gateList;