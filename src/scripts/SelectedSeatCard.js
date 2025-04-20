class SelectedSeatCard{
    constructor(){
        this.onConfirm = null;
        this.seatId = null
    }

    setSeat(seatId){
        this.seatId = seatId;
        const card = document.getElementById("selectedSeatCard")
        // alert(seatId);
        document.getElementById("seatTitle").innerText = seatId;
        document.getElementById("bookSeatConfirm").onclick = (event) => {this.onConfirm(seatId)};
    }

    renderDOM(){
        return `
        <div id="selectedSeatCard" class="card">
            <div class="card-body">
                <h2 id="seatTitle"></h2>
                <button id="bookSeatConfirm" class="btn btn-primary">Book seat</button>
            </div>
        </div>`;
    }
}