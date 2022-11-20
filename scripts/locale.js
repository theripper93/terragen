import { initControls } from './controls.js';
import { initMenu } from './menu.js';
import { setupInteractions } from './interactions.js';

fetch(`./translations/${navigator.language}.json`).then(async (locale) => {
    const res = await locale.json();
    initTranslations(res);
}).catch((err) => {
    fetch("./translations/en.json").then(async (locale) => {
        const res = await locale.json();
        initTranslations(res);
    });
})

const flattenObj = (ob) => {
    let result = {};
    for (const i in ob) {
        if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
            const temp = flattenObj(ob[i]);
            for (const j in temp) {
                result[i + '.' + j] = temp[j];
            }
        }
        else {
            result[i] = ob[i];
        }
    }
    return result;
};

function initTranslations(data){
    i18n.translator.add({values: flattenObj(data)});

    function translate(el) {
        let innerHtml = el.innerHTML;
        const toLocalize = innerHtml.matchAll(/{(.*?)}/g);
        let currentLocal = toLocalize.next();
        while (!currentLocal.done){
            const key = currentLocal.value[1];
            const value = i18n(key);
            innerHtml = innerHtml.replace(currentLocal.value[0], value);
            currentLocal = toLocalize.next();
        }
        el.innerHTML = innerHtml;
    }
    translate(document.querySelector("#ui"));
    initControls();
    initMenu();
    setupInteractions();
    canvas.loading.localization = true;
    canvas.loading.loadComplete();
};



