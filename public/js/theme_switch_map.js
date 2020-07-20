const w = document.querySelector(".message");
const root = document.documentElement;

window.addEventListener('storage', () => {
    var theme = localStorage.getItem("theme");

    if (theme == "lightsOff") {
        // Map
        root.style.setProperty("--selected-fill", "#ffa31a");
        root.style.setProperty("--stroke-color", "#ffffff");
        root.style.setProperty("--stroke-w", "0.5");
        root.style.setProperty("--populated", "#472e07");

        // User list
        root.style.setProperty("--userBlockBackground", "#000000");
        root.style.setProperty("--userBlockBorder", "1.5px");

        root.style.setProperty("--userBlockFontColor", "#ffffff");
        root.style.setProperty("--userBlockBorderColor", "#ffa31a");
        root.style.setProperty("--shadowColor", "#000000");
    } else {
        // Lights On
        // Map
        root.style.setProperty("--selected-fill", "#a1bad0");
        root.style.setProperty("--stroke-color", "#3d3d3b");
        root.style.setProperty("--stroke-w", "0.3");
        root.style.setProperty("--populated", "#c6d4df");

        // User list
        root.style.setProperty("--userBlockBackground", "#dff0ff");
        root.style.setProperty("--userBlockBorder", "0");

        root.style.setProperty("--userBlockFontColor", "#000000");
        root.style.setProperty("--userBlockBorderColor", "#2299a1");
        root.style.setProperty("--shadowColor", "#ebebeb");
    }
});