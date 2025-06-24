function configPWA(){
    const manifest = {
      name: "KURT-PRO",
      short_name: "KURT-PRO", // title of app
      start_url: "/#kurt-pro",
      display: "browser",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: "https://picsum.photos/192/192",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "https://picsum.photos/512/512",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const manifestURL = URL.createObjectURL(blob);
    
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = manifestURL;
    document.head.appendChild(link);
}