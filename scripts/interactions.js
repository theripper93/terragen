export function setupInteractions(){
    setupSliders();
    setupNewProjectMenu();
    setupUndo();
    setupTextureDragAndDrop();

    document.getElementById("help").onclick = (e) => {
        const helpMenu = document.getElementById("help-window");
        helpMenu.style.display = helpMenu.style.display == "block" ? "none" : "block";
    };
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

function setupTextureDragAndDrop(){
    const addTexture = document.getElementById("add-texture");
    const textureDropAreas = addTexture.querySelectorAll(".texture-drop-area");
    textureDropAreas.forEach((dropArea) => {
        dropArea.addEventListener("dragover", (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        dropArea.addEventListener("drop", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const mapId = e.target.dataset.mapId;
            const files = e.dataTransfer.files;
            if (files.length == 1){
                loadTextureFromDrop(files[0], mapId);
            }
            if(files.length > 1){
                const matchedFiles = matchFilesToMap(files);
                for(let [mapId, file] of Object.entries(matchedFiles)){
                    loadTextureFromDrop(file, mapId);
                }
            }
        });
    });

    addTexture.querySelector("#cancel").onclick = (e) => {
        addTexture.style.display = "none";
    }
    addTexture.querySelector("#confirm").onclick = (e) => {
        addTexture.style.display = "none";
        canvas.MaterialManager.addMaterial(canvas.addTexture);
    }
}

function loadTextureFromDrop(file, mapId){
    const span = document.querySelector(`.texture-drop-area[data-map-id="${mapId}"] span`);
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        span.innerHTML = filename;
        span.style.backgroundImage = `url(${e.target.result})`;
        span.style.backgroundSize = "cover";
        canvas.addTexture[mapId] = e.target.result;
    }
    reader.readAsDataURL(file);
}

function matchFilesToMap(files){
    const matchedFiles = {};
    for(let file of files){
        const filename = file.name;
        const lcFn = filename.toLowerCase();
        for(let [k,v] of Object.entries(fileNameMapping)){
            if(v.some((s) => lcFn.includes(s))){
                matchedFiles[k] = file;
            }
        }
    }
    return matchedFiles;
}


const fileNameMapping = {
    "colorMap": ["color", "diffuse", "albedo"],
    "normalMap": ["normal", "bump"],
    "roughnessMap": ["roughness", "glossiness"],
    "metalnessMap": ["metalness", "specular"],
    "occulsionMap": ["ao", "ambient", "occlusion"],
    "emissiveMap": ["emissive", "emission"]
}