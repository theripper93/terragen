import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';

globalThis.canvas = {
    DEBUG: true,
    _debug: {},
};

canvas.scene = new THREE.Scene();
canvas.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

canvas.renderer = new THREE.WebGLRenderer();
canvas.renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector("#canvas-container").appendChild( canvas.renderer.domElement );

canvas.camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );

    if(canvas.DEBUG){
        canvas._debug.cube.rotation.x += 0.1;
        canvas._debug.cube.rotation.y += 0.1;
    }

	canvas.renderer.render(canvas.scene, canvas.camera);
};

function setupBasicShape(){
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    canvas._debug.cube = cube;
    canvas.scene.add( cube );
}

if(canvas.DEBUG) setupBasicShape();

animate();