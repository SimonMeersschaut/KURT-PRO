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
        this.dom.className = "modal fade";

        // Create modal-dialog
        const modalDialog = document.createElement("div");
        modalDialog.className = "modal-dialog";

        // Create modal-content
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        // Create modal-header
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";

        const modalTitle = document.createElement("h1");
        modalTitle.className = "modal-title fs-5";
        modalTitle.id = "exampleModalLabel";
        modalTitle.textContent = this.title;

        // const closeButton = document.createElement("button");
        // closeButton.type = "button";
        // closeButton.className = "btn-close";
        // closeButton.setAttribute("data-bs-dismiss", "modal");
        // closeButton.setAttribute("aria-label", "Close");

        modalHeader.appendChild(modalTitle);
        // modalHeader.appendChild(closeButton);

        // Create modal-body
        const modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        modalBody.id = "settings-body";
        // append the content as a child
        modalBody.appendChild(this.innerHTML);

        // Create modal-footer
        const modalFooter = document.createElement("div");
        modalFooter.className = "modal-footer";

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "btn btn-primary";
        saveButton.textContent = this.buttonText;

        modalFooter.appendChild(saveButton);

        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalDialog.appendChild(modalContent);
        this.dom.appendChild(modalDialog);

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
        saveButton.addEventListener("click", () => {
            if (this.onclick == null){
                // pass
            }
            else
                this.onclick();
            closeModal();
        });

        // closeButton.addEventListener("click", closeModal);
        backdrop.addEventListener("click", closeModal);
    }
}