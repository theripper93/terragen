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
            if(event.button !== 2 && event.button !== 0) return;
            if(!this.mesh.visible) return;
            if(this.mode === "sculpt") {canvas.sculpting.history = canvas.scene.terrain.geometry.clone();}
        })
        document.addEventListener('mouseup', (event) => {
            this.leftDown = false;
            this.rightDown = false;
            this._lockCursor = false;
            if(event.button !== 2 && event.button !== 0) return;
            if(!this.mesh.visible) return;
            if(this.mode === "paint") canvas.painting.brush.commitGraphicsToTexture();
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

    toggleMode(){
        this.mode = this.mode === "sculpt" ? "paint" : "sculpt";
    }

    get sculptMode(){
        return this._sculptMode ?? "raise";
    }

    set sculptMode(value){
        this._sculptMode = value;
    }

    get geometry(){
        return new THREE.SphereGeometry(1, 32, 32);
    }

    get material(){
        return new THREE.MeshStandardMaterial({color: "hsl(23, 100%, 53%)",emissive: "hsl(23, 100%, 53%)",emissiveIntensity:1, transparent: true, opacity: 0.5});
    }

    get radius(){
        return this._radius ?? 1;
    }

    set radius(value) {
        value = Math.max(0.01, value);
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
                vertex.distance = Math.log(this.radius/distance);
                vertex.index = i;
                result.push(vertex);
            }
        }
        return result;
    }

    getAverageUVs() {
        return this._currentIntersect.uv;
    }

    _onMouseMove(){
        if(this.mode === "sculpt") this._onSculpt();
        if(this.mode === "paint") this._onPaint();
    }

    _onSculpt(){
        if((!this.leftDown && !this.rightDown) || !this.mesh.visible) return;
        const vertexData = this.getVertexData();
        const geometry = canvas.scene.terrain.geometry;
        const positionAttributes = geometry.getAttribute("position");
        const normalAttributes = geometry.getAttribute("normal");
        const uvAttributes = geometry.getAttribute("uv");
        const avgY = vertexData.reduce((a, b) => a + b.y, 0) / vertexData.length;

        function getRowVerts(geometry, rowNumber) {

            const posArray = geometry.getAttribute("position").array;
            const rowLength = canvas.project.geometry.width + 1
            const start = rowNumber * rowLength * 3;
            const end = start + rowLength * 3;
            const result = [];
            for(let i=start; i < end; i+=3){
                result.push(new THREE.Vector3(posArray[i], posArray[i+1], posArray[i+2]));
            }
            return result;

        }

        function getColVerts(geometry, colNumber) {
                
            const posArray = geometry.getAttribute("position").array;
            const rowLength = canvas.project.geometry.width + 1
            const result = [];
            for (let i = colNumber * 3; i < posArray.length; i += rowLength * 3){
                result.push(new THREE.Vector3(posArray[i], posArray[i+1], posArray[i+2]));
            }
            return result;

        }

        function getTotalDistance(vertices) {
            let totalDist = 0;
            for(let i=0; i < vertices.length - 1; i++){
                const next = vertices[i + 1];
                const current = vertices[i];
                totalDist += current.distanceTo(next)
                
            }
            return totalDist
        }

        function getDistUpToPoint(vertices, point) {
            let totalDist = 0;
            const v2Point = new THREE.Vector2(point.x, point.z);
            const v2Current = new THREE.Vector2();
            for(let i=0; i < vertices.length - 1; i++){
                const next = vertices[i + 1];
                const current = vertices[i];
                v2Current.set(current.x, current.z);
                if (v2Point.distanceTo(v2Current) < 0.0001) return totalDist
                totalDist += current.distanceTo(next);
            }
            return totalDist;
        }

        for(let vertex of vertexData){
            let x = positionAttributes.getX(vertex.index);
            let y = positionAttributes.getY(vertex.index);
            let z = positionAttributes.getZ(vertex.index);

            const cameraPosition = canvas.camera.position;
            if(this.sculptMode === "raise"){
                let diff = this.leftDown ? vertex.distance/30 : -vertex.distance/30;
                diff = Math.sign(diff) * Math.min(Math.abs(diff), this.radius);
                y += diff;
                positionAttributes.setY(vertex.index, y);
            }else if(this.sculptMode === "flat"){
                let diff = this.leftDown ? this.radius/30 : -this.radius/30;
                y += diff;
                positionAttributes.setY(vertex.index, y);
            }else if(this.sculptMode === "smooth"){
                let diff = vertex.distance/10;
                const vAvgY = (y + avgY)/2
                const vDiff = vAvgY - y;
                y += vDiff * diff;
                positionAttributes.setY(vertex.index, y);

            }else if(this.sculptMode === "mold"){
                let diff = this.leftDown ? vertex.distance/30 : -vertex.distance/30;
                diff = Math.sign(diff) * Math.min(Math.abs(diff), this.radius);
                const direction = new THREE.Vector3(vertex.x, vertex.y, vertex.z).sub(cameraPosition).normalize();
                diff*=-1;
                x += direction.x * diff;
                y += direction.y * diff;
                z += direction.z * diff;
                positionAttributes.setXYZ(vertex.index, x, y, z);
            }else if(this.sculptMode === "normal"){
                let diff = this.leftDown ? vertex.distance/30 : -vertex.distance/30;
                diff = Math.sign(diff) * Math.min(Math.abs(diff), this.radius);
                const direction = new THREE.Vector3(normalAttributes.getX(vertex.index), normalAttributes.getY(vertex.index), normalAttributes.getZ(vertex.index)).normalize();
                x += direction.x * diff;
                y += direction.y * diff;
                z += direction.z * diff;
                positionAttributes.setXYZ(vertex.index, x, y, z);
            }


        }

        function recomputeAllUV(geometry) { 
            const posCount = geometry.getAttribute("position").count;
            const uvAttributes = geometry.getAttribute("uv");
            const positionAttributes = geometry.getAttribute("position");
            for (let i = 0; i < posCount; i++) {
                const row = Math.floor(i / (canvas.project.geometry.width + 1))
                const col = i % (canvas.project.geometry.width + 1)
                const vertex = new THREE.Vector3(
                    positionAttributes.getX(i),
                    positionAttributes.getY(i),
                    positionAttributes.getZ(i)
                )
                const rowVerts = getRowVerts(geometry, row)
                const colVerts = getColVerts(geometry, col)
                const rowDist = getTotalDistance(rowVerts)
                const colDist = getTotalDistance(colVerts)
                const rowDistUpToPoint = getDistUpToPoint(
                    rowVerts,
                    vertex
                )
                const colDistUpToPoint = getDistUpToPoint(
                    colVerts,
                    vertex
                )
                const rowUV = rowDistUpToPoint / rowDist
                const colUV = colDistUpToPoint / colDist
                uvAttributes.setXY(i, rowUV, 1 - colUV)
            }
        }

        recomputeAllUV(geometry);

        geometry.computeVertexNormals();
        geometry.normalizeNormals();
        geometry.computeTangents();
        geometry.computeBoundsTree();
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
        geometry.attributes.uv.needsUpdate = true;
    }

    _onPaint(){
        if((!this.leftDown && !this.rightDown) || !this.mesh.visible) return;
        canvas.painting.brush.paint();
    }

    updatePosition(){
        if(this._lockCursor || this._altDown) this.mesh.visible = false;
        else{
            this.raycaster.setFromCamera(this.mouse, canvas.camera);
            const intersects = this.raycaster.intersectObjects([canvas.scene.terrain], true);
            if (intersects.length > 0) {
                this._currentIntersect = intersects[0];
                this.mesh.position.copy(intersects[0].point);
            }
            this.mesh.visible = intersects.length > 0;
        }

        canvas.controls.enablePan = !this.mesh.visible;
        canvas.controls.enableZoom = !this.mesh.visible;
    }
}