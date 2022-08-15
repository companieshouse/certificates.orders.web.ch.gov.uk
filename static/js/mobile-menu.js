window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector("ul#navigation").classList.add("mobile-hidden");
    document.querySelector(".js-toggle-nav.js-header-toggle").click(() => {
        event.preventDefault();
        document.querySelector("ul#navigation").classList.toggle("mobile-hidden");
        document.querySelector("#global-nav").classList.toggle("open");
    })
})