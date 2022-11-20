export function initPainting(textureSize) {

    canvas.painting.colorMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.normalMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.roughnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.metalnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.occulsionMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});

    canvas.painting.pixiApps = [canvas.painting.colorMap, canvas.painting.normalMap, canvas.painting.roughnessMap, canvas.painting.metalnessMap, canvas.painting.occulsionMap];

    canvas.painting.pixiApps.forEach(a => {
        a.renderer.backgroundColor = 0xffffff;
        a.width = textureSize.x;
        a.height = textureSize.y;
        a.rTex = PIXI.RenderTexture.create({width: textureSize.x, height: textureSize.y});
        a.spriteTex = PIXI.RenderTexture.create({width: textureSize.x, height: textureSize.y});
    });

    canvas.painting.brush = new Brush(textureSize);

    canvas.painting.brush.commitGraphicsToTexture();
}


class Brush{
    constructor(textureResolution){
        this.textureResolution = textureResolution;
        this._matrix = new PIXI.Matrix();
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

    get blurFilter(){
        return new PIXI.filters.BlurFilter(this.blurStrength, 16);
    }

    get blurStrength(){
        return (this.radius) * parseFloat(document.getElementById("blur").value) * 2;
    }

    get opacity(){
        return parseFloat(document.getElementById("opacity").value);
    }

    get scale(){
        return parseFloat(document.getElementById("scale").value);
    }

    get color(){
        return parseInt(document.getElementById("color").value.replace("#", "0x"));
    }

    get matrix(){
        const scale = this.scale;
        this._matrix.set(scale, 0, 0, scale, 0, 0);
        return this._matrix;
    }

    getTexture(mapId){
        return canvas.MaterialManager.currentMaterial().pixiTextures[mapId]
    }

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
        stroke.beginTextureFill({texture: this.getTexture("colorMap"), color: this.color, alpha: this.opacity, matrix: this.matrix});
        stroke.drawCircle(position.x, position.y, this.radius);
        stroke.endFill();
        const scale = this.brushScale;
        stroke.scale.set(scale.x, scale.y);
        stroke.filters = [this.blurFilter];
        this.maps.colorMap.stage.addChild(stroke);
        this.updateMaterial();
    }

    _old_paint(){
        const position = this.getPosition();
        const stroke = new PIXI.Graphics();
        stroke.beginFill(this.color, this.opacity);
        stroke.drawCircle(position.x, position.y, this.radius);
        stroke.endFill();
        const scale = this.brushScale;
        stroke.scale.set(scale.x, scale.y);
        stroke.filters = [this.blurFilter];
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

    commitGraphicsToTexture(){
        for(const app of canvas.painting.pixiApps){
            app.renderer.render(app.stage, {renderTexture: app.rTex});
            const swap = app.spriteTex;
            app.spriteTex = app.rTex;
            app.rTex = swap;
            const sprite = new PIXI.Sprite(app.spriteTex);
            app.stage.removeChildren();
            app.stage.addChild(sprite);
        }
        this.updateMaterial();
    }
}