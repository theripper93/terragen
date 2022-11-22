import * as THREE from './lib/three.module.js';
import { EXRLoader } from "./lib/EXRLoader.js";
import { OrbitControls } from './lib/OrbitControls.js';
import { Cursor } from './editor/cursor.js';
import { initPainting, clearTextures } from './editor/painting.js';
import { MaterialManager } from './editor/materialManager.js';
import { importProject, exportProject } from './editor/importExport.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from './lib/three-mesh-bvh.js';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

globalThis.THREE = THREE;

globalThis.isMobile = function() {
    let check = false;
    const isChromium = !!window.chrome;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check || navigator.userAgentData?.mobile || !isChromium;
};

if(isMobile()) {
    document.querySelector("main").style.display = "none";
    document.getElementById("mobile-warning").style.display = "flex";
}

globalThis.canvas = {
    DEBUG: true,
    addTexture: {},
    project: {
        geometry: {
            width: 5,
            height: 5,
            resolution: 5,
        },
        texture: {
            resolution: 1024,
        }
    },
    projectManager: {
        importProject,
        exportProject,
    },
    loading: {
        exr: false,
        localization: false,
        loadComplete: () =>{
            if(canvas.loading.exr && canvas.loading.localization && !isMobile()){
                canvas.painting.brush.updateMaterial();
                document.querySelector("main").style.display = "block";
            }
        }
    },
    painting: {},
    sculpting: {
        undo: () => {
            const swap = canvas.scene.terrain.geometry;
            canvas.scene.terrain.geometry = canvas.sculpting.history;
            canvas.sculpting.history = swap;

            const geometry = canvas.scene.terrain.geometry;
            geometry.computeVertexNormals();
            geometry.normalizeNormals();
            geometry.computeTangents();
            geometry.computeBoundsTree();
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
        },
    },
    materials: {
        wireframe: new THREE.MeshBasicMaterial({color: 0xff9500, wireframe: true, side: THREE.DoubleSide}),
        noTexture: new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide, map: (new THREE.TextureLoader).load("./assets/uv_grid_opengl.jpg")} ),
        terrain: new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide} ),
    },
    MaterialManager: new MaterialManager(),
    initProject: () => {
        canvas.scene.terrain?.removeFromParent();
        canvas.scene.gridHelper?.removeFromParent();
        const res = new THREE.Vector2(canvas.project.texture.resolution, canvas.project.texture.resolution)
        clearTextures(res);
        const geometry = new THREE.PlaneGeometry( canvas.project.geometry.width, canvas.project.geometry.height, Math.round(canvas.project.geometry.width*canvas.project.geometry.resolution), Math.round(canvas.project.geometry.height*canvas.project.geometry.resolution) );
        geometry.rotateX(-Math.PI/2);
        const material = canvas.materials.terrain;
        material.map = new THREE.CanvasTexture(canvas.painting.colorMap.view);
        material.normalMap = new THREE.CanvasTexture(canvas.painting.normalMap.view);
        material.roughnessMap = new THREE.CanvasTexture(canvas.painting.roughnessMap.view);
        material.metalnessMap = new THREE.CanvasTexture(canvas.painting.metalnessMap.view);
        material.aoMap = new THREE.CanvasTexture(canvas.painting.occulsionMap.view);
        const cube = new THREE.Mesh( geometry, material );
        cube.geometry.computeBoundsTree();
        canvas.scene.terrain = cube;
        canvas.scene.add( cube );
        canvas.scene.gridHelper = new THREE.GridHelper( Math.max(canvas.project.geometry.height,canvas.project.geometry.width) + 5, Math.max(canvas.project.geometry.height,canvas.project.geometry.width) + 5, new THREE.Color("#00c3ff"), new THREE.Color("magenta") );
        canvas.scene.add( canvas.scene.gridHelper );
        canvas.scene.gridHelper.position.y -= 0.02;
    }
};

initPainting(new THREE.Vector2(canvas.project.texture.resolution, canvas.project.texture.resolution));

function loadEXR(url) {
    const pmremGenerator = new THREE.PMREMGenerator(canvas.renderer);
    pmremGenerator.compileEquirectangularShader();
    new EXRLoader().setDataType(THREE.FloatType).load(url, onLoaded);

    function onLoaded(texture) {
      let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      let newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
      canvas.scene.environment = newEnvMap;
      pmremGenerator.dispose();
      canvas.loading.exr = true;
      canvas.loading.loadComplete();
    }
}

canvas.scene = new THREE.Scene();
canvas.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
canvas.camera.position.z = 5;
canvas.camera.position.y = 2;

function setRendererSize(){
    canvas.renderer.setSize( window.innerWidth, window.innerHeight );
    canvas.renderer.setPixelRatio( window.devicePixelRatio );
    canvas.camera.aspect = window.innerWidth / window.innerHeight;
    canvas.camera.updateProjectionMatrix();
}

canvas.renderer = new THREE.WebGLRenderer();
setRendererSize();
window.onresize = () => { setRendererSize(); }
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
canvas.scene._mode = "terrain";
canvas.scene.toggleMode = (mode) => {
    const modes = Object.keys(canvas.materials)
    const index = modes.indexOf(canvas.scene._mode);
    const nextIndex = (index + 1) % modes.length;
    canvas.scene._mode = modes[nextIndex];
    canvas.scene.terrain.material = canvas.materials[canvas.scene._mode];
};

canvas.scene.background = new THREE.Color("hsl(261, 56%, 18%)");

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 5, 5, 5 );
directionalLight.lookAt( 0, 0, 0 );
canvas.scene.directionalLight = directionalLight;
canvas.scene.add( directionalLight );

loadEXR("assets/venice_sunrise_1k.exr")

canvas.cursor = new Cursor();

function animate() {
	requestAnimationFrame( animate );
    canvas.cursor.updatePosition();
    canvas.controls.update();
	canvas.renderer.render(canvas.scene, canvas.camera);
};

if(canvas.DEBUG) canvas.initProject();

animate();



window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
};
//javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()