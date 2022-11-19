import { GLTFExporter } from './lib/GLTFExporter.js';

export function initMenu(){

    const menuElement = document.getElementById('menu');

    menuElement.addEventListener("click", (e)=>{
        const action = e.target.dataset.action;
        if(!action) return;
        switch (action) {
            case "export":
                exportGLB();
        }
    })

}

function exportGLB(){
    const exporter = new GLTFExporter();
    canvas.scene.terrain.material = canvas.materials.terrain;
exporter.parse(
	canvas.scene.terrain,
	function ( gltf ) {

		console.log( gltf );
		downloadJSON( gltf );

	},
	function ( error ) {
		console.log( 'An error happened' );
	},
	{binary: true}
);
}