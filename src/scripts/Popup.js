class Popup{
    constructor(title, innerHTML, buttonText="Save changes"){
        this.title = title;
        this.innerHTML = innerHTML;
        this.onclick = null;
        this.buttonText = buttonText
    }

    show(){
        const container = document.createElement("div");
        container.className = "modal fade"
        container.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">${this.title}</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="settings-body">
                ${this.innerHTML}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary">${this.buttonText}</button>
            </div>
            </div>
        </div>`

        // Create container
        document.body.appendChild(container);

        // Show the modal by adding Bootstrap's "show" and "modal-backdrop" classes
        container.classList.add("show");
        container.style.display = "block";

        // Create and append a backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);

        // Close the modal when the close button or backdrop is clicked
        const closeModal = () => {
            container.classList.remove("show");
            container.style.display = "none";
            backdrop.remove();
            container.remove();
        };

        // Save data when the "Save changes" button is clicked
        const saveButton = container.querySelector(".btn-primary");
        saveButton.addEventListener("click", () => {
            if (this.onclick == null)
                console.warn("`onclick` is `null`.");
            else
                this.onclick();
            closeModal();
        });

        container.querySelector(".btn-close").addEventListener("click", closeModal);
        container.querySelector("[data-bs-dismiss='modal']").addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);

    }
}