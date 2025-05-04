function createBanner(){
    const banner = document.createElement("button");
    banner.innerText = "KURT-PRO";
    banner.onclick = () => {window.location.assign("?kurt-pro");};
    return banner;
}