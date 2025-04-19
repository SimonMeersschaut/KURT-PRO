/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(zoneId){
        this.zoneId = zoneId;
    }

    renderDOM(){
        return `<div class="grid" id="grid">`;
    }

    drawSeats(){
        // Fetch the seats
        fetch("https://raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/Maps/resources/maps/zones/"+this.zoneId.toString()+"/compression.json")
        .then(response => response.json())
        .then(data => {
            // Fetched seats, now draw them
            const gridContainer = document.getElementById('grid');
            gridContainer.style.backgroundImage = `url('https://github.com/SimonMeersschaut/KURT-PRO/blob/Maps/resources/maps/zones/`+this.zoneId+`/map.png?raw=true')`
    
            Object.entries(data).forEach(([id, value]) => {
                const [gridColumn, gridRow] = value.split(';');
                const gridItem = document.createElement('div');
                gridItem.id = `plaats-${id}`;
                gridItem.style.gridColumn = gridColumn;
                gridItem.style.gridRow = gridRow;
    
                // Add a class to the grid item (e.g., free, booked, etc.)
                gridItem.classList.add('free'); // Default class, adjust as needed
    
                gridContainer.appendChild(gridItem);
            });
        })

    }
}