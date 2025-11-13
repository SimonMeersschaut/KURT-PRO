(function() {{
    'use strict';

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
    const script = document.createElement('script');
    script.setAttribute("nonce", "abc123");
    script.textContent = "{JS_CONTENT}";
    document.body.appendChild(script);
}})();