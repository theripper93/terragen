export class MaterialManager{
    constructor(debug = false){
        this.materials = [];
        if(debug) this.addMaterial({colorMap: "../assets/uv_grid_opengl.jpg"});
    }

    addMaterial(textures){
        const material = new Material(textures);
        this.materials.push(material);
        return material;
    }

    currentMaterial(){
        return this.materials[0];
    }
}


class Material{
    constructor(textures){
        this.colorMap = textures.colorMap;
        this.normalMap = textures.normalMap;
        this.roughnessMap = textures.roughnessMap;
        this.metalnessMap = textures.metalnessMap;
        this.occulsionMap = textures.occulsionMap;
        this.pixiTextures = {};
        this.initPixiTextures();
    }

    get blank(){
        return PIXI.Texture.WHITE;
    }

    initPixiTextures(){
        this.pixiTextures.colorMap = this.colorMap ? PIXI.Texture.from(this.colorMap) : this.blank;
        this.pixiTextures.normalMap = this.normalMap ? PIXI.Texture.from(this.normalMap) : this.blank;
        this.pixiTextures.roughnessMap = this.roughnessMap ? PIXI.Texture.from(this.roughnessMap) : this.blank;
        this.pixiTextures.metalnessMap = this.metalnessMap ? PIXI.Texture.from(this.metalnessMap) : this.blank;
        this.pixiTextures.occulsionMap = this.occulsionMap ? PIXI.Texture.from(this.occulsionMap) : this.blank;
    }

    destroy(){
        this.pixiTextures.colorMap.destroy();
        this.pixiTextures.normalMap.destroy();
        this.pixiTextures.roughnessMap.destroy();
        this.pixiTextures.metalnessMap.destroy();
        this.pixiTextures.occulsionMap.destroy();
    }
}