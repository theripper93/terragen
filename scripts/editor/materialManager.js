export class MaterialManager{
    constructor(debug = false){
        this.materials = [];
        this._materialIndex = 0;
        // if(debug) this.addMaterial({colorMap: "../assets/uv_grid_opengl.jpg"});
    }

    addMaterial(textures){
        const material = new Material(textures);
        this.materials.push(material);
        const el = this.getElement(material);
        document.querySelector("#texture-panel").appendChild(el);
        return material;
    }

    removeMaterial(index){
        const mat = this.materials[index];
        mat.destroy();
        const texturePanel = document.querySelector("#texture-panel");
        texturePanel.removeChild(texturePanel.children[index]);
        this.materials.splice(index, 1);
    }

    currentMaterial(){
        return this.materials[this._materialIndex];
    }

    getElement(material){
        const li = document.createElement("li");
        li.style.backgroundImage = `url(${material.colorMap})`;
        //        <span class="material-name">${material.name}</span>
        li.innerHTML = `
        <div class="darken"></div>
        <button class="material-delete">X</button>
        `
        li.onclick = (e) => {
            this._materialIndex = this.materials.indexOf(material);
            document.querySelector("#texture-panel").querySelectorAll("li").forEach((el) => {
                el.classList.remove("selected");
            });
            li.classList.add("selected");
        };
        const deleteBtn = li.querySelector(".material-delete");
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeMaterial(this.materials.indexOf(material));
        }
        return li;
    }

    clear(){
        this.materials.forEach((mat) => {
            mat.destroy();
        });
        this.materials = [];
        this._materialIndex = 0;
        document.querySelector("#texture-panel").innerHTML = "";
    }
}


class Material{
    constructor(textures){
        this.colorMap = textures.colorMap;
        this.normalMap = textures.normalMap;
        this.roughnessMap = textures.roughnessMap;
        this.metalnessMap = textures.metalnessMap;
        this.occulsionMap = textures.occulsionMap;
        this.name = textures.name;
        this.pixiTextures = {};
        this.initPixiTextures();
    }

    get blank(){
        return PIXI.Texture.WHITE;
    }

    initPixiTextures(){
        this.pixiTextures.colorMap = this.colorMap ? PIXI.Texture.from(this.colorMap) : null;
        this.pixiTextures.normalMap = this.normalMap ? PIXI.Texture.from(this.normalMap) : null;
        this.pixiTextures.roughnessMap = this.roughnessMap ? PIXI.Texture.from(this.roughnessMap) : null;
        this.pixiTextures.metalnessMap = this.metalnessMap ? PIXI.Texture.from(this.metalnessMap) : null;
        this.pixiTextures.occulsionMap = this.occulsionMap ? PIXI.Texture.from(this.occulsionMap) : null;
    }

    export(){
        return {
            colorMap: this.colorMap,
            normalMap: this.normalMap,
            roughnessMap: this.roughnessMap,
            metalnessMap: this.metalnessMap,
            occulsionMap: this.occulsionMap,
            name: this.name,
        }
    }

    destroy(){
        this.pixiTextures.colorMap?.destroy(true);
        this.pixiTextures.normalMap?.destroy(true);
        this.pixiTextures.roughnessMap?.destroy(true);
        this.pixiTextures.metalnessMap?.destroy(true);
        this.pixiTextures.occulsionMap?.destroy(true);
    }
}