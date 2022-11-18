import en from "../translations/en.json" assert {type: 'json'};

i18n.translator.add({values: en});

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

translate(document.body);