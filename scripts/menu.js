import { GLTFExporter } from './lib/GLTFExporter.js';

export function initMenu(){

    const menuElement = document.getElementById('menu');

    menuElement.addEventListener("click", (e)=>{
        const action = e.target.dataset.action;
        if(!action) return;
        switch (action) {
            case "new":
                document.getElementById("new-project").style.display = "block";
                break;
            case "export":
                exportGLB();
                break;
            case "open":
                canvas.projectManager.importProject();
                break;
            case "save":
                canvas.projectManager.exportProject();
                break;
        }
    })

}

function exportGLB() {
  const exporter = new GLTFExporter();
  canvas.scene.terrain.material = canvas.materials.terrain;
  exporter.parse(
    canvas.scene.terrain,
    function (gltf) {
      saveArrayBuffer(gltf, "scene.glb");
    },
    function (error) {
      console.log("An error happened");
    },
    { binary: true }
  );
}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
}

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}