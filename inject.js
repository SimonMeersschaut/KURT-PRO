if (!document.getElementById('root')) {{
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
}}

// Inject CSS
const style = document.createElement('style');
style.textContent = "{CSS_CONTENT}";
document.head.appendChild(style);

// Inject JS
function inject(){
    console.log("Injecting js.");
    {JS_CONTENT}
}


inject();