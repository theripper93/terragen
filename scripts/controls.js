export function initControls(){

    const controlsElement = document.getElementById('controls');

    controlsElement.addEventListener("click", (e)=>{
        debugger
        const tool = e.target.dataset.tool;
        if(!tool) return;
        switch (tool) {
            case "cycle-view":
                canvas.scene.toggleMode();
                break;
            case "cycle-mode":
                canvas.cursor.toggleMode();
                break;
            case "sculpt":
                const sculptMode = e.target.dataset.sculptMode;
                canvas.cursor.sculptMode = sculptMode;
                const sculptButtons = document.getElementById("sculpt-buttons");
                sculptButtons.querySelectorAll("button").forEach((button)=>{
                    button.classList.remove("active");
                })
                e.target.classList.add("active");
                break;
        }
    })

}