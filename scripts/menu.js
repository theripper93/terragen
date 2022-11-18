export function initMenu(){

    const menuElement = document.getElementById('menu');

    menuElement.addEventListener("click", (e)=>{
        const action = e.target.dataset.action;
        if(!action) return;
        switch (action) {
        }
    })

}