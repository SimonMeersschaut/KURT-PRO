/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(zoneId, enableSelecting){
        this.zoneId = zoneId;
        this.enableSelecting = enableSelecting;
        this.onSelectSeat = null;
    }

    renderDOM(){
        return `<div class="grid" id="grid">`;
    }

    drawSeats(){
        // Set hover animation
        if (this.enableSelecting){
            document.getElementById('grid').classList.add('selectable');
        }
        // Fetch the seats
        fetch("https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/Maps/resources/maps/zones/2/compression.json")
        .then(response => response.json())
        .then(data => {
            // Fetched seats, now draw them
            const gridContainer = document.getElementById('grid');
            gridContainer.style.backgroundImage = `url('https://github.com/SimonMeersschaut/KURT-PRO/blob/Maps/resources/maps/zones/`+this.zoneId+`/map.png?raw=true')`
    
            Object.entries(data).forEach(([id, value]) => {
                const [gridColumn, gridRow] = value.split(";");
                const gridItem = document.createElement("div");
                gridItem.id = `plaats-${id}`;
                gridItem.style.gridColumn = gridColumn;
                gridItem.style.gridRow = gridRow;
    
                // Add a class to the grid item (e.g., free, booked, etc.)
                gridItem.classList.add("free"); // Default class, adjust as needed
                gridItem.onclick = () => {this.handleSeatClick(id)};
                gridContainer.appendChild(gridItem);
            });
        })
    }
    /*
    Handle the user clicking on a seat.
    */
    handleSeatClick(id){
        if (!this.enableSelecting)
            return;

        // de-select all other seats
        Array.from(document.getElementsByClassName("selected")).forEach((element) => {
            element.classList.remove("selected")
        });
        // select this element
        const gridItem = document.getElementById(`plaats-${id}`);
        gridItem.classList.add("selected");

        // Call event listener
        if (this.onSelectSeat != null)
            this.onSelectSeat(id);
    }
}