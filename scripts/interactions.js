export function setupInteractions(){
    const sliders = document.querySelectorAll(`input[type="range"]`);
    sliders.forEach((slider) => {
        slider.addEventListener("wheel", (e) => {
            const value = parseFloat(e.target.value);
            const delta = e.deltaY;
            const step = parseFloat(e.target.step);
            const min = parseFloat(e.target.min);
            const max = parseFloat(e.target.max);
            if (delta < 0){
                e.target.value = Math.min(value + step, max);
            }
            else if (delta > 0){
                e.target.value = Math.max(value - step, min);
            }
        });
    });
}