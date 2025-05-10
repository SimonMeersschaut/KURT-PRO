class Button{
    constructor(type, text, onclick){
        this.type = type;
        this.text = text;
        this.onclick = onclick;
    }

    renderDOM(){
        this.DOM = document.createElement("button");
        this.DOM.classList.add("btn");
        if (this.type == 1)
            this.DOM.classList.add("btn-primary");
        else if (this.type == 2)
            this.DOM.classList.add("btn-danger");
        this.DOM.innerText = this.text;
        return this.DOM
    }
}