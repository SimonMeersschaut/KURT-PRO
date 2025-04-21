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
                <div class="checkmark-container">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                        <path class="checkmark-check" fill="none" d="M14 27l10 10 14-14"/>
                    </svg>
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
            const spinner = this.loaderElement.querySelector('.spinner-circle');
            if (spinner) {
                spinner.classList.add('success');
            }
        }

        setTimeout(() => {this.stop()}, 1500)
    }

    error(msg){
        // alert(msg);
        console.error(msg);
    }
}