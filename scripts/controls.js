import { clearNewTexture } from "./interactions.js";

export function initControls(){

    const controlsElement = document.getElementById('controls');

    controlsElement.addEventListener("click", (e)=>{
        const tool = e.target.dataset.tool;
        if(!tool) return;
        const sculptButtons = document.getElementById("sculpt-buttons");
        const paintButtons = document.getElementById("paint-buttons");
        switch (tool) {
            case "cycle-view":
                canvas.scene.toggleMode();
                switch (canvas.scene._mode) {
                    case "wireframe":
                        e.target.innerHTML =
                          '<i class="fa-duotone fa-border-none"></i>'
                        break;
                    case "noTexture":
                        e.target.innerHTML =
                          '<i class="fa-duotone fa-circle-half-stroke"></i>'
                        break;
                    case "terrain":
                        e.target.innerHTML =
                          '<i class="fa-duotone fa-bring-forward"></i>'
                        break;
                }
                break;
            case "cycle-mode":
                canvas.cursor.toggleMode();
                if(canvas.cursor.mode === "sculpt"){
                    sculptButtons.style.display = "block";
                    paintButtons.style.display = "none";
                    e.target.innerHTML = '<i class="fa-duotone fa-scalpel-line-dashed"></i>';
                }else{
                    sculptButtons.style.display = "none";
                    paintButtons.style.display = "flex";
                    e.target.innerHTML =
                      '<i class="fa-duotone fa-paintbrush-fine"></i>'
                }
                break;
            case "sculpt":
                const sculptMode = e.target.dataset.sculptMode;
                canvas.cursor.sculptMode = sculptMode;
                sculptButtons.querySelectorAll("button").forEach((button)=>{
                    button.classList.remove("active");
                })
                e.target.classList.add("active");
                break;
            case "paint":
                const paintMode = e.target.dataset.paintMode;
                canvas.cursor.paintMode = paintMode;
                switch (paintMode) {
                    case "newTexture":
                        const display = document.getElementById("add-texture").style.display;
                        if(display === "flex"){
                            document.getElementById("add-texture").style.display = "none";
                        }else{
                            clearNewTexture();
                            document.getElementById("add-texture").style.display = "flex";
                        }
                        break;
                }
                break;
        }
    })

}