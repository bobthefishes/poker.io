let theme = "dark"
let css_link = document.getElementById("css-styles");

function theme_change() {
    if (theme === "poker") {
        theme = "dark";
    } else {
        theme = "poker";
    };
    if (theme === "dark") {
        css_link.href = "css/home.css";
    } else {
        css_link.href = "";
    };
}
