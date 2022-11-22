export function initPainting(textureSize) {

    canvas.painting.colorMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.normalMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.roughnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.metalnessMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});
    canvas.painting.occulsionMap = new PIXI.Application({width: textureSize.x, height: textureSize.y});

    for(let [k,v] of Object.entries(canvas.painting)){
        v.mapId = k;
    }

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

export function clearTextures(textureSize){
    canvas.painting.pixiApps.forEach(a => {
        a.stage.removeChildren();
        a.renderer.resize(textureSize.x, textureSize.y);
        a.rTex?.destroy(true);
        a.spriteTex?.destroy(true);
        a.rTex = PIXI.RenderTexture.create({width: textureSize.x, height: textureSize.y});
        a.spriteTex = PIXI.RenderTexture.create({width: textureSize.x, height: textureSize.y});
        a.renderer.render(a.stage, a.rTex);
        a.renderer.render(a.stage, a.spriteTex);
    });
}


class Brush{
    constructor(){
        this._matrix = new PIXI.Matrix();
        this.brushes = [];
        this.loadBrushes();
    }

    loadBrushes(){
        for(let i = 0; i < 10; i++){
            const brush = PIXI.Texture.from(`./assets/brushes/${i}.png`);
            this.brushes.push(brush);
        }
    }

    get textureResolution(){
        return { x: canvas.project.texture.resolution, y: canvas.project.texture.resolution };
    }

    get brushMask(){
        return PIXI.Sprite.from(this.brushes[this.brushStrength]);
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

    get brushStrength(){
        return parseFloat(document.getElementById("blur").value);
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
        return canvas.MaterialManager.currentMaterial()?.pixiTextures[mapId]
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
        const scale = this.brushScale;
        for(const app of canvas.painting.pixiApps){
            const texture = this.getTexture(app.mapId);
            if(!texture) continue;
            const stroke = new PIXI.Graphics();
            const color = app.mapId === "colorMap" ? this.color : 0xffffff;
            stroke.beginTextureFill({texture, color, alpha: this.opacity, matrix: this.matrix});
            stroke.drawCircle(position.x, position.y, this.radius);
            stroke.endFill();
            const mask = this.brushMask;
            mask.anchor.set(0.5);
            mask.width = mask.height = this.radius * 2;
            mask.position.set(position.x, position.y);
            stroke.scale.set(scale.x, scale.y);
            stroke.mask = mask;
            app.stage.addChild(mask);
            app.stage.addChild(stroke);
        }
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

    undo(){
        for(const app of canvas.painting.pixiApps){
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


