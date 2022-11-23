import { GLTFExporter } from "../lib/GLTFExporter.js";
import { GLTFLoader } from "../lib/GLTFLoader.js";

export async function exportProject(){

    const exportData = {
        project: canvas.project,
        materials: [],
        textures: {},
        geometry: null,
    };

    canvas.MaterialManager.materials.forEach((material)=>{
        exportData.materials.push(material.export());
    })

    for(let app of canvas.painting.pixiApps){
        exportData.textures[app.mapId] = app.view.toDataURL();
    }

    const exporter = new GLTFExporter();
    const currentMat = canvas.scene.terrain.material;
    canvas.scene.terrain.material = new THREE.MeshBasicMaterial();
    const gltf = await exporter.parseAsync(canvas.scene.terrain)
    canvas.scene.terrain.material = currentMat;

    exportData.geometry = gltf;

    const data = JSON.stringify(exportData);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "terrascape-project.json";
    a.href = url;
    a.click();

}

export async function importProject(){
    
        const data = await requestUpload();

        if(!data) return;
        canvas.project = data.project;
        canvas.initProject();
        canvas.MaterialManager.clear();
        data.materials.forEach((material)=>{ canvas.MaterialManager.addMaterial(material) });
        
        for(let [mapId, texture] of Object.entries(data.textures)){
            const sprite = PIXI.Sprite.from(texture);
            const app = canvas.painting[mapId];
            app.stage.removeChildren();
            app.stage.addChild(sprite);
        }

        const loader = new GLTFLoader();
        loader.parse(JSON.stringify(data.geometry), "", (gltf)=>{
            const geometry = gltf.scene.children[0].geometry.clone();
            canvas.scene.terrain.geometry = geometry;
            geometry.computeVertexNormals();
            geometry.normalizeNormals();
            geometry.computeTangents();
            geometry.computeBoundsTree();
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;

        })

        delete canvas.sculpting.history;

}

export async function requestUpload(){
    return new Promise((resolve, reject)=>{
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", ()=>{
            const file = input.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", ()=>{
                const data = JSON.parse(reader.result);
                resolve(data);
            });
            reader.readAsText(file);
        });
        input.click();
    });
}