class Popup{
    constructor(title, innerHTML, buttonText="Save changes"){
        this.title = title;
        this.innerHTML = innerHTML;
        this.dom = null;
        this.onclick = null; // on null -> just close the popup
        this.buttonText = buttonText
    }

    show(){
        this.dom = document.createElement("div");
        this.dom.className = "modal fade"
        this.dom.innerHTML = `
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

        // Add `container` as first element of `body`
        document.body.insertBefore(this.dom, document.body.firstChild);

        // Show the modal by adding Bootstrap's "show" and "modal-backdrop" classes
        this.dom.classList.add("show");
        this.dom.style.display = "block";

        // Create and append a backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(backdrop);

        // Close the modal when the close button or backdrop is clicked
        const closeModal = () => {
            this.dom.classList.remove("show");
            this.dom.style.display = "none";
            backdrop.remove();
            this.dom.remove();
        };

        // Save data when the "Save changes" button is clicked
        const saveButton = this.dom.querySelector(".btn-primary");
        saveButton.addEventListener("click", () => {
            if (this.onclick == null){
                // log.warn("`onclick` is `null`.");
                // pass
            }
            else
                this.onclick();
            closeModal();
        });

        this.dom.querySelector(".btn-close").addEventListener("click", closeModal);
        this.dom.querySelector("[data-bs-dismiss='modal']").addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);

    }
}