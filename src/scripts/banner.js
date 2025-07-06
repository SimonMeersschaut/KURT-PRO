/*
Generates the DOM content, which will be placed inside the banner (when you are on the original site).
*/
function createBanner(){
    const banner = document.createElement("button");
    banner.innerText = "KURT-PRO";
    banner.onclick = () => {window.location.assign("?kurt-pro");};
    return banner;
}