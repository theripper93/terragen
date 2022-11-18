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
                        e.target.innerHTML = '<i class="fa-solid fa-border-none"></i>';
                        break;
                    case "noTexture":
                        e.target.innerHTML = '<i class="fa-regular fa-circle"></i>';
                        break;
                    case "terrain":
                        e.target.innerHTML = '<i class="fa-solid fa-circle"></i>';
                        break;
                }
                break;
            case "cycle-mode":
                canvas.cursor.toggleMode();
                if(canvas.cursor.mode === "sculpt"){
                    sculptButtons.style.display = "block";
                    paintButtons.style.display = "none";
                    debugger
                    e.target.innerHTML = '<i class="fa-solid fa-draw-polygon"></i>';
                }else{
                    sculptButtons.style.display = "none";
                    paintButtons.style.display = "block";
                    e.target.innerHTML = '<i class="fa-solid fa-paintbrush"></i>';
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
                paintButtons.querySelectorAll("button").forEach((button)=>{
                    button.classList.remove("active");
                })
                e.target.classList.add("active");
                break;
        }
    })

}