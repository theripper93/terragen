export function setupInteractions(){
    setupSliders();
    setupNewProjectMenu();
    setupUndo();
    setupTextureDragAndDrop();
    globalThis.clearNewTexture = clearNewTexture;
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
    newProjectMenu.querySelector(".cancel").onclick = (e) => {
        newProjectMenu.style.display = "none";
    }
    newProjectMenu.querySelector(".confirm").onclick = (e) => {
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
    const fileDropAreas = addTexture.querySelectorAll(".file-input-label");
    addTexture.querySelectorAll("input[type='file']").forEach((fileInput) => {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const mapId = e.target.parentElement.dataset.mapId;
            loadTextureFromDrop(file, mapId);
        });
    });
    function bindDragAndDropEvents(el){
        el.addEventListener("dragover", (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        el.addEventListener("drop", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const mapId = e.target.dataset.mapId || e.target.parentElement.dataset.mapId;
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
    }
    textureDropAreas.forEach(bindDragAndDropEvents);
    fileDropAreas.forEach(bindDragAndDropEvents);

    addTexture.querySelector(".cancel").onclick = (e) => {
        addTexture.style.display = "none";
    }
    addTexture.querySelector(".confirm").onclick = (e) => {
        addTexture.style.display = "none";
        canvas.MaterialManager.addMaterial(canvas.addTexture);
    }

    /*document.getElementById("add-texture-button").onclick = (e) => {
        canvas.addTexture = {};
        document.getElementById("add-texture").style.display = "block";
    };*/
}

function loadTextureFromDrop(file, mapId){
    const fileinputlabel = document.querySelector(`.texture-drop-area[data-map-id="${mapId}"] .file-input-label`);
    const filename = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        fileinputlabel.innerHTML = filename;
        const parent = fileinputlabel.parentElement;
        parent.style.backgroundImage = `url(${e.target.result})`;
        parent.style.backgroundSize = "cover";
        canvas.addTexture[mapId] = e.target.result;
        if(mapId == "colorMap"){
            canvas.addTexture.name = filename;
        }
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
    "occlusionMap": ["ao", "ambient", "occlusion"],
    "emissiveMap": ["emissive", "emission"]
}

export function clearNewTexture(){
    canvas.addTexture = {};
    const addTexture = document.getElementById("add-texture");
    addTexture.querySelectorAll("input[type='file']").forEach((fileInput) => {
        fileInput.value = "";
    });
    addTexture.querySelectorAll(".file-input-label").forEach((fileInputLabel) => {
        fileInputLabel.innerHTML = i18n("textures.uploadFile");
        fileInputLabel.parentElement.style.backgroundImage = "";
    });
}