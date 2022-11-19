import * as PIXI from '../lib/pixi.min.mjs';

export function initPainting(textureSize) {

    canvas.painting.colorMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.normalMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.roughnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.metalnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.occulsionMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});

    canvas.painting.brush = new Brush(textureSize);












}


class Brush{
    constructor(textureResolution){
        this.textureResolution = textureResolution;
        this.color = 0xff0000;
    }

    get maps(){
        return canvas.painting;
    }

    get radius(){
        const brushRadius = canvas.cursor.radius;
        const maxSize = Math.max(canvas.project.geometry.width, canvas.project.geometry.height);
        const brushSize = brushRadius / maxSize;
        const textureSize = this.textureResolution.x;
        return brushSize * textureSize;
    }

    get brushScale(){
        const maxSize = Math.max(canvas.project.geometry.width, canvas.project.geometry.height);
        const minSize = Math.min(canvas.project.geometry.width, canvas.project.geometry.height);
        if(maxSize === minSize) return {x: 1, y: 1};
        if(maxSize === canvas.project.geometry.width){
            return {x: 1, y: canvas.project.geometry.width / canvas.project.geometry.height};
        }else{
            return {x: canvas.project.geometry.height / canvas.project.geometry.width, y: 1};
        }
    }

    getTexture(){}

    getPosition(){
        const cursorPosition = canvas.cursor.mesh.position;
        const cursorPosition2D = new THREE.Vector2(cursorPosition.x, cursorPosition.z);
        const terrainOrigin = new THREE.Vector2(-canvas.project.geometry.width/2, -canvas.project.geometry.height/2);
        const terrainSize = new THREE.Vector2(canvas.project.geometry.width, canvas.project.geometry.height);
        const position = cursorPosition2D.sub(terrainOrigin).divide(terrainSize).multiply(this.textureResolution);
        const maxSize = Math.max(canvas.project.geometry.width, canvas.project.geometry.height);
        const minSize = Math.min(canvas.project.geometry.width, canvas.project.geometry.height);
        const ratio = maxSize / minSize;
        if(maxSize === canvas.project.geometry.width){
            position.y /= ratio;
        }else{
            position.x /= ratio;
        }
        return position;
    }

    paint(){
        const position = this.getPosition();
        const stroke = new PIXI.Graphics();
        stroke.beginFill(0xff00ff);
        stroke.drawCircle(position.x, position.y, this.radius);
        stroke.endFill();
        const scale = this.brushScale;
        stroke.scale.set(scale.x, scale.y);
        this.maps.colorMap.stage.addChild(stroke);
        this.updateMaterial();
    }

    updateMaterial(){
        const terrainMat = canvas.materials.terrain;
        for(let val of Object.values(terrainMat)){
            if(val instanceof THREE.Texture){
                val.needsUpdate = true;
            }
        }
    }
}