class SelectedSeatCard{
    constructor(buttons){
        if (buttons == undefined)
            throw new Error("`buttons` in `selectedSeatCard` was `undefined`.");
        this.buttons = buttons;

        this.seatId = null
        this.seatNr = null;

        // set defualt start & end time
        this.startTimeHours = settings.startTimeHours;
        this.endTimeHours = settings.endTimeHours;
    }

    updateSeatTime(){
        document.getElementById("seatTime").innerText = `${this.startTimeHours}:00 - ${this.endTimeHours}:00`;
    }

    setSeat(seatNr, seatId){
        this.seatNr = seatNr;
        this.seatId = seatId;
        
        const card = document.getElementById("selectedSeatCard");
        if (card == null) throw new Error("`selectedSeatCard` could not be found on the DOM.");
        card.style.display = "block";


        const title = document.getElementById("seatTitle");
        if (title == null) throw new Error("`selectedSeatCard` could find `title` on the DOM.");
        title.innerText = seatNr;

        for (let i = 0; i < this.buttons.length; i++){
            this.buttons[i].DOM.onclick = (event) => {this.buttons[i].onclick(this.seatNr, this.seatId, this.startTimeHours, this.endTimeHours)};
        }

        this.updateSeatTime();
    }

    renderDOM(){
        const container = document.createElement("div");
        container.id = "selectedSeatCard";
        container.classList.add("card");
        container.style.display = "none";

        const body = document.createElement("div");
        body.classList.add("card-body");
        const title = document.createElement("h2");
        title.id = "seatTitle";
        body.appendChild(title);
        const paragraph = document.createElement("p");
        paragraph.id = "seatTime";
        body.appendChild(paragraph);
        container.appendChild(body);

        if (this.buttons == undefined)
            throw new Error("`buttons` in `selectedSeatCard` was `undefined`.");
        for (let i = 0; i < this.buttons.length; i++){
            body.appendChild(this.buttons[i].renderDOM());
        }
        return container;
    }
}