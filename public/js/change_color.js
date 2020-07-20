/* Switch between light mode and dark mode through toggle switch */

function toggleSwitch() {
  if(document.getElementById("myCheckbox").checked === true){
    // Lights Off
    localStorage.setItem("theme", "lightsOff");
    // Slider Icon -> Moon
    var icon = document.getElementsByClassName("slider")[0];
    icon.classList.add("fa-moon-o");
    icon.classList.remove("fa-sun-o");

    // nav bar background
    var header = document.querySelector("header");
    header.style.backgroundColor = "#000000";
    header.style.color = "#ffffff";
    var slider = document.querySelector(".slider");
    slider.style.backgroundColor = "#000000";
    slider.style.border = "1px solid white";

    // Colot Theme -> Dark mode
    var root = document.documentElement;
    root.style.setProperty('--color_bg', '#000000');
    root.style.setProperty('--color_char', '#ffffff');

    // Header
    document.getElementById("t2").style.color = '#000000';
    document.getElementById("t2").style.backgroundColor = '#ffa31a';
    document.getElementById("logo1522").classList.add("inverted");

  } else {
    // Lights On
    localStorage.setItem("theme", "lightsOn");
    // Slider Icon -> Moon
    var icon = document.getElementsByClassName("slider")[0];
    icon.classList.add("fa-sun-o");
    icon.classList.remove("fa-moon-o");

    // nav bar background
    var header = document.querySelector("header");
    header.style.backgroundColor = "#f8f8f1";
    header.style.color = "#000000";
    var slider = document.querySelector(".slider");
    slider.style.backgroundColor = "#ffe057";
    slider.style.border = "";

    // Color Theme -> Light mode
    var root = document.documentElement;
    root.style.setProperty('--color_bg', '#f0f5f7');
    root.style.setProperty('--color_char', '#3d3d3b');

    // Header
    document.getElementById("t2").style.backgroundColor = '#f0f5f7';
    document.getElementById("logo1522").classList.remove("inverted");
  }
}