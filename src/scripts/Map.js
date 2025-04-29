/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(zoneId, enableSelecting){
        this.zoneId = zoneId;
        this.enableSelecting = enableSelecting;
        this.onSelectSeat = null;
        this.selectedSeat = null;
        this.backgroundImage = `https://github.com/SimonMeersschaut/KURT-PRO/blob/Maps/resources/maps/zones/`+this.zoneId+`/map.png?raw=true`
        this.initialized = false; // will be set on true when the map is loaded initially
    }

    renderDOM(){
        return `<div class="grid" id="grid">`;
    }
    
    // TODO: DOCS
    drawSeats(data){
        // if (disabledSeats == null)
        //     disabledSeats = [];
        // Set hover animation
        if (this.enableSelecting){
            document.getElementById('grid').classList.add('selectable');
        }
        
        const gridContainer = document.getElementById('grid');
        gridContainer.style.backgroundImage = `url("`+this.backgroundImage+`")`

        Object.entries(data).forEach(([seatNr, value]) => {
            const [gridColumn, gridRow] = value.split(";");
            const gridItem = document.createElement("div");
            gridItem.id = `plaats-${seatNr}`;
            gridItem.style.gridColumn = gridColumn;
            gridItem.style.gridRow = gridRow;

            if (seatNr == this.selectedSeat)
                gridItem.classList.add("selected");
            gridItem.onclick = () => {this.handleSeatClick(seatNr)};
            gridContainer.appendChild(gridItem);
        })
    }
    /*
    Handle the user clicking on a seat.
    
    forceSelect will overwrite enableSelecting
    */
    handleSeatClick(seatNr, forceSelect=false){
        if (!forceSelect)
            if (!this.enableSelecting)
                return;
        
        const seatDOM = document.getElementById(`plaats-${seatNr}`);
        if (!seatDOM.classList.contains("free"))
            return;

        this.selectedSeat = seatNr;

        // de-select all other seats
        Array.from(document.getElementsByClassName("selected")).forEach((element) => {
            element.classList.remove("selected")
        });
        // select this element
        if (seatDOM == null)
            return;
        seatDOM.classList.add("selected");

        // get the seat Id
        const seatId = seatDOM.getAttribute("seatId");

        // Call event listener
        if (this.onSelectSeat != null)
            this.onSelectSeat(seatNr, seatId);
    }

    /*
    */
   fetchMapData(locationId, zoneId, selectedDay, startTime, endTime){
        if (startTime == null || endTime == null)
            throw new Error("`startTime` or `endTime` can not be `null`.")
        var mapLoader = new Loader("Loading map");
        tunnel.fetchMapData(zoneId)
        .then(mapData => {
            if (!this.initialized){
                // first initialize the map
                this.drawSeats(mapData);
                this.initialized = true;
            }
        })
        .then(() => {
            if (this.initialized){
                // remove all 'free' classes
                const freeSeats = document.getElementsByClassName("free");
                for (let i=0; i<freeSeats.length; i++){
                    freeSeats[i].classList.remove("free");
                }
                // remove the selected seat(s)
                const selectedSeats = document.getElementsByClassName("selected");
                for (let i=0; i<selectedSeats.length; i++){
                    selectedSeats[i].classList.remove("selected");
                }
            }
            (async () => {
                var timeout = 40; // ms between seats opening up
                const freeSeatGenerator = tunnel.getDayData(locationId, zoneId, selectedDay, startTime, endTime);
                const seatQueue = [];
                let isProcessing = false;
        
                const processQueue = async () => {
                    if (isProcessing) return;
                    isProcessing = true;
        
                    while (seatQueue.length > 0) {
                        const seatInfo = seatQueue.shift();
                        if (seatInfo["seatNr"] == undefined)
                            throw new Error("`seatInfo` had no attribute `seatNr`.");
                        const seatDOM = document.getElementById(`plaats-${seatInfo["seatNr"]}`)
                        if (seatDOM == null)
                            throw new Error(`Seat identifier "plaats-${seatInfo["seatNr"]}" was not found.`);
                        seatDOM.setAttribute("seatId", seatInfo["id"])
                        seatDOM.classList.add("free");
                        await new Promise(resolve => setTimeout(resolve, timeout));
                    }
                    mapLoader.stop();
                    isProcessing = false;
                };
        
                while (true) {
                    const { value: seatInfo, done } = await freeSeatGenerator.next();
                    // seatInfo = {"seatNr":seatNr, "seatId":seatId}
                    if (done || seatInfo === undefined) {
                        // all seats are now available -> show them immediatly
                        processQueue(); // for edge case: 0 seats available (loader would spin infinitely)
                        timeout = 0;
                        break;
                    }
        
                    seatQueue.push(seatInfo);
                    processQueue();
                }
            })();
        })
        .catch(error => {
            mapLoader.error(error);
        })
   }
}