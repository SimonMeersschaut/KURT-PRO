class SelectedSeatCard{
    constructor(buttons, startTimeHours, endTimeHours){
        if (buttons == undefined) throw new Error("`buttons` in `selectedSeatCard` was `undefined`.");
        if (startTimeHours == undefined) throw new Error("`startTimeHours` in `selectedSeatCard` was `undefined`.");
        if (endTimeHours == undefined) throw new Error("`endTimeHours` in `selectedSeatCard` was `undefined`.");
        this.buttons = buttons;

        this.seatId = null
        this.seatNr = null;

        this.dom = null;

        // set defualt start & end time
        this.startTimeHours = startTimeHours;
        this.endTimeHours = endTimeHours;
    }

    setSeatTime(startTimeHours, endTimeHours){
        this.startTimeHours = startTimeHours;
        this.endTimeHours = endTimeHours;
        updateSeatTime();
    }

    updateSeatTime(){
        this.dom.querySelector("#seatTime").innerText = `${this.startTimeHours}:00 - ${this.endTimeHours}:00`;
    }

    setSeat(seatNr, seatId){
        this.seatNr = seatNr;
        this.seatId = seatId;
        
        if (this.dom == null) throw new Error("`selectedSeatCard` could not be found on the DOM.");
        this.dom.style.display = "block";


        const title = this.dom.querySelector("#seatTitle");
        if (title == null) throw new Error("`selectedSeatCard` could find `title` on the DOM.");
        title.innerText = seatNr;

        for (let i = 0; i < this.buttons.length; i++){
            this.buttons[i].dom.onclick = (event) => {this.buttons[i].onclick(this.seatNr, this.seatId, this.startTimeHours, this.endTimeHours)};
        }

        this.updateSeatTime();
    }

    renderDOM(){
        this.dom = document.createElement("div");
        this.dom.id = "selectedSeatCard";
        this.dom.classList.add("card");
        // this.dom.style.display = "none";

        const body = document.createElement("div");
        body.classList.add("card-body");
        const title = document.createElement("h2");
        title.id = "seatTitle";
        body.appendChild(title);
        const paragraph = document.createElement("p");
        paragraph.id = "seatTime";
        body.appendChild(paragraph);
        this.dom.appendChild(body);

        if (this.buttons == undefined)
            throw new Error("`buttons` in `selectedSeatCard` was `undefined`.");
        for (let i = 0; i < this.buttons.length; i++){
            body.appendChild(this.buttons[i].renderDOM());
        }
        this.updateSeatTime();
        return this.dom;
    }

    disableButtons(){
        const btns = this.dom.querySelector("#selectedSeatCard").getElementsByTagName("button");
        for (let i = 0; i < btns.length; i++)
            btns[i].disabled = true;
    }

    setTitle(title){
        this.dom.querySelector("#seatTitle").innerText = title;
    }
}