class Button{
    constructor(type, text, onclick){
        this.type = type;
        this.text = text;
        this.onclick = onclick;
        this.dom = null;
    }

    renderDOM(){
        this.dom = document.createElement("button");
        this.dom.onclick = this.onclick;
        this.dom.classList.add("btn");
        if (this.type == 1)
            this.dom.classList.add("btn-primary");
        else if (this.type == 2)
            this.dom.classList.add("btn-danger");
        this.dom.innerText = this.text;
        return this.dom;
    }
}