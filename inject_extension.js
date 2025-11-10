(function() {
    'use strict';

    if (!document.getElementById('root')) {
        const rootDiv = document.createElement('div');
        rootDiv.id = 'root';
        document.body.appendChild(rootDiv);
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('app.css');
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('app.js');
    document.body.appendChild(script);
})();
