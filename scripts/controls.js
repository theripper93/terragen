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
                break;
            case "cycle-mode":
                canvas.cursor.toggleMode();
                if(canvas.cursor.mode === "sculpt"){
                    sculptButtons.style.display = "block";
                    paintButtons.style.display = "none";
                }else{
                    sculptButtons.style.display = "none";
                    paintButtons.style.display = "block";
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