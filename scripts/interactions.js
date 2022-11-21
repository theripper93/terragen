export function setupInteractions(){
    setupSliders();
    setupNewProjectMenu();
    setupUndo();
}

function setupSliders(){
    const sliders = document.querySelectorAll(`input[type="range"]`);
    sliders.forEach((slider) => {
        slider.addEventListener("wheel", (e) => {
            const value = parseFloat(e.target.value);
            const delta = e.deltaY;
            const step = parseFloat(e.target.step);
            const min = parseFloat(e.target.min);
            const max = parseFloat(e.target.max);
            if (delta < 0){
                e.target.value = Math.min(value + step, max);
            }
            else if (delta > 0){
                e.target.value = Math.max(value - step, min);
            }
        });
    });
}

function setupNewProjectMenu(){
    const newProjectMenu = document.getElementById("new-project");
    newProjectMenu.querySelector("#cancel").onclick = (e) => {
        newProjectMenu.style.display = "none";
    }
    newProjectMenu.querySelector("#confirm").onclick = (e) => {
        newProjectMenu.style.display = "none";
        const width = parseFloat(newProjectMenu.querySelector("#width").value);
        const height = parseFloat(newProjectMenu.querySelector("#height").value);
        const geometryResolution = parseFloat(newProjectMenu.querySelector("#geometry-resolution").value);
        const textureResolution = parseFloat(newProjectMenu.querySelector("#texture-resolution").value);
        canvas.project = {
            geometry: {
                width: width,
                height: height,
                resolution: geometryResolution
            },
            texture: {
                resolution: textureResolution
            }
        }
        canvas.initProject()
    }
}

function setupUndo(){
    function undo(){
        if(canvas.cursor.mode == "paint"){
            canvas.painting.brush.undo();
        }else{
            canvas.sculpting.undo();
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "z" && e.ctrlKey){
            undo();
        }
    });
    //document.getElementById("undo").onclick = undo;
}