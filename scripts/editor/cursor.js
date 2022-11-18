import * as THREE from '../lib/three.module.js';

export class Cursor{
    constructor(){
        const geometry = this.geometry;
        const material = this.material;
        this.mesh = new THREE.Mesh(geometry, material);
        this.radius = 0.4;
        canvas.scene.add(this.mesh);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.offsetX / canvas.renderer.domElement.clientWidth) * 2 - 1;
            this.mouse.y = -(event.offsetY / canvas.renderer.domElement.clientHeight) * 2 + 1;
            this._onMouseMove();
        }, false);
        document.addEventListener('wheel', (event) => {
            if(this.mesh.visible) this.radius = this.radius - event.deltaY/5000;
        }, false);
        document.addEventListener('mousedown', (event) => {
            this.leftDown = event.button === 0;
            this.rightDown = event.button === 2;
            if(!this.mesh.visible) this._lockCursor = true;
        })
        document.addEventListener('mouseup', (event) => {
            this.leftDown = false;
            this.rightDown = false;
            this._lockCursor = false;
        })
        document.addEventListener('keydown', (event) => {
            this._altDown = event.altKey;
        })
        document.addEventListener('keyup', (event) => {
            this._altDown = false;
        })
    }

    get mode(){
        return this._mode ?? "sculpt";
    }

    set mode(value){
        this._mode = value;
    }

    get geometry(){
        return new THREE.SphereGeometry(1, 32, 32);
    }

    get material(){
        return new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.5});
    }

    get radius(){
        return this._radius ?? 1;
    }

    set radius(value){
        this.mesh.scale.set(value, value, value);
        this._radius = value;
    }

    getVertexData(){
        if(!this.mesh.visible) return null;
        const terrain = canvas.scene.terrain;
        const position = this.mesh.position;
        const positionAttributes = terrain.geometry.getAttribute("position");
        const count = positionAttributes.count;
        const result = [];
        for(let i=0; i < count; i++){
            let x = positionAttributes.getX(i);
            let y = positionAttributes.getY(i);
            let z = positionAttributes.getZ(i);
            const vertex = new THREE.Vector3(x, y, z);
            vertex.applyMatrix4(terrain.matrixWorld);
            const distance = vertex.distanceTo(position);
            if(distance < this.radius){
                vertex.distance = this.radius/distance;
                vertex.index = i;
                result.push(vertex);
            }
        }
        return result;
    }

    _onMouseMove(){
        if(this.mode === "sculpt") this._onSculpt();
    }

    _onSculpt(){
        if((!this.leftDown && !this.rightDown) || !this.mesh.visible) return;
        const vertexData = this.getVertexData();
        const geometry = canvas.scene.terrain.geometry;
        for(let vertex of vertexData){
            const positionAttributes = geometry.getAttribute("position");
            let y = positionAttributes.getY(vertex.index);
            const diff = this.leftDown ? vertex.distance/100 : -vertex.distance/100;
            y += diff;
            positionAttributes.setY(vertex.index, y);
        }

        geometry.computeVertexNormals();
        geometry.normalizeNormals();
        geometry.computeTangents();
        geometry.computeBoundsTree();
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
    }

    updatePosition(){
        if(this._lockCursor || this._altDown) this.mesh.visible = false;
        else{
            this.raycaster.setFromCamera(this.mouse, canvas.camera);
            const intersects = this.raycaster.intersectObjects([canvas.scene.terrain], true);
            if(intersects.length > 0){
                this.mesh.position.copy(intersects[0].point);
            }
            this.mesh.visible = intersects.length > 0;
        }

        canvas.controls.enablePan = !this.mesh.visible;
        canvas.controls.enableZoom = !this.mesh.visible;
    }
}