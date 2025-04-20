class Loader {
    constructor(name) {
        this.name = name;
        this.loaderElement = this.renderDOM();
        document.body.appendChild(this.loaderElement);
    }

    renderDOM() {
        // Create a container for the spinning loader
        const container = document.createElement('div');
        container.className = 'loader-spinner-container';

        // Add the spinning circle and success checkmark
        container.innerHTML = `
            <div class="loader-spinner">
                <div class="spinner-circle"></div>
                <div class="success-checkmark">
                    <div class="check-icon">
                        <span class="icon-line line-tip"></span>
                        <span class="icon-line line-long"></span>
                        <div class="icon-circle"></div>
                        <div class="icon-fix"></div>
                    </div>
                </div>
            </div>
        `;
        return container;
    }

    stop() {
        // Remove the loader from the DOM
        if (this.loaderElement && this.loaderElement.parentNode) {
            this.loaderElement.parentNode.removeChild(this.loaderElement);
        }
    }

    success() {
        // Trigger the success animation
        if (this.loaderElement) {
            this.loaderElement.classList.add('success');
        }
    }
}


