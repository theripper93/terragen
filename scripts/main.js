import * as THREE from './lib/three.module.js';
import { EXRLoader } from "./lib/EXRLoader.js";
import { OrbitControls } from './lib/OrbitControls.js';
import { Cursor } from './editor/cursor.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from './lib/three-mesh-bvh.js';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

globalThis.canvas = {
    DEBUG: true,
    project: {},
};

function loadEXR(url) {
    const pmremGenerator = new THREE.PMREMGenerator(canvas.renderer);
    pmremGenerator.compileEquirectangularShader();
    new EXRLoader().setDataType(THREE.FloatType).load(url, onLoaded);

    function onLoaded(texture) {
      let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      let newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
      canvas.scene.environment = newEnvMap;
      pmremGenerator.dispose();
    }
}

canvas.scene = new THREE.Scene();
canvas.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
canvas.camera.position.z = 5;
canvas.camera.position.y = 2;
canvas.renderer = new THREE.WebGLRenderer();
canvas.renderer.setSize( window.innerWidth, window.innerHeight );
canvas.renderer.setPixelRatio( window.devicePixelRatio );
document.querySelector("#canvas-container").appendChild( canvas.renderer.domElement );

canvas.controls = new OrbitControls( canvas.camera, canvas.renderer.domElement );
canvas.controls.rotateSpeed = 0.5;
canvas.controls.panSpeed = 0.5;
canvas.controls.enableDamping = true;
canvas.controls.dampingFactor = 0.1;
canvas.controls.mouseButtons = {
    LEFT: undefined,
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
}


canvas.scene.gridHelper = new THREE.GridHelper( 10, 10 );
canvas.scene.add( canvas.scene.gridHelper );
canvas.scene.axisHelper = new THREE.AxesHelper( 5 );
canvas.scene.add( canvas.scene.axisHelper );

loadEXR("assets/venice_sunrise_1k.exr")

canvas.cursor = new Cursor();

function animate() {
	requestAnimationFrame( animate );
    canvas.cursor.updatePosition();
    canvas.controls.update();
	canvas.renderer.render(canvas.scene, canvas.camera);
};

function setupBasicShape(){
    var geometry = new THREE.BoxGeometry( 5, 1, 5, 50, 50, 50 );
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
    for(let i = 0; i < geometry.attributes.color.count; i++){
        geometry.attributes.color.setXYZ(i, 1,1,1);
    }
    var material = new THREE.MeshStandardMaterial( { color: 0xffffff, vertexColors: true} );
    var cube = new THREE.Mesh( geometry, material );
    cube.geometry.computeBoundsTree();
    canvas.scene.terrain = cube;
    canvas.scene.add( cube );
}

if(canvas.DEBUG) setupBasicShape();

animate();