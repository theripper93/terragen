export class MaterialManager{
    constructor(){
        this.materials = [];
        this._materialIndex = 0;
    }

    addMaterial(textures){
        const material = new Material(textures);
        this.materials.push(material);
        const el = this.getElement(material);
        document.querySelector("#texture-panel").appendChild(el);
        this._materialIndex = this.materials.length - 1;
        this.selectMaterial();
        this.updateDisplay();
        return material;
    }

    removeMaterial(index){
        const mat = this.materials[index];
        mat.destroy();
        const texturePanel = document.querySelector("#texture-panel");
        texturePanel.removeChild(texturePanel.children[index]);
        this.materials.splice(index, 1);
        const selected = document.querySelector("#texture-panel").querySelector(".active");
        if(!selected){
            this._materialIndex = 0;
            this.selectMaterial();
        }
        this.updateDisplay();
    }

    currentMaterial(){
        return this.materials[this._materialIndex];
    }

    getElement(material){
        const li = document.createElement("li");
        li.innerHTML = `
        <div class="texture-image" style="background-image: url(${material.colorMap})"></div>
        <button class="material-delete">X</button>
        `
        function liClick(e){
            this._materialIndex = this.materials.indexOf(material);
            document.querySelector("#texture-panel").querySelectorAll("li").forEach((el) => {
                el.classList.remove("active");
            });
            li.classList.add("active");
        }

        li.onclick = liClick.bind(this);
        li.querySelector(".texture-image").onclick = liClick.bind(this);

        const deleteBtn = li.querySelector(".material-delete");
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeMaterial(this.materials.indexOf(material));
        }
        return li;
    }

    selectMaterial(){
        const index = this._materialIndex;
        if(index < 0 || index >= this.materials.length) return;
        const texturePanel = document.querySelector("#texture-panel");
        texturePanel.querySelectorAll("li").forEach((el) => {
            el.classList.remove("active");
        });
        texturePanel.children[index].classList.add("active");
    }

    updateDisplay(){
        const texturePanel = document.querySelector("#texture-panel");
        if(this.materials.length === 0){
            texturePanel.classList.add("empty");
        }else{
            texturePanel.classList.remove("empty");
        }
    }

    clear(){
        this.materials.forEach((mat) => {
            mat.destroy();
        });
        this.materials = [];
        this._materialIndex = 0;
        document.querySelector("#texture-panel").innerHTML = "";
        this.updateDisplay();
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