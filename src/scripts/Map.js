/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(zoneId, enableSelecting, zoneName){
        if (zoneName == null) throw new Error("zoneName was null");
        this.zoneName = zoneName;
        this.zoneId = zoneId;
        this.enableSelecting = enableSelecting;
        this.onSelectSeat = null;
        this.selectedSeat = null;
        this.backgroundImage = `https://github.com/SimonMeersschaut/KURT-PRO/blob/main/resources/maps/zones/`+this.zoneId+`/map.png?raw=true`
        this.initialized = false; // will be set on true when the map is loaded initially
    }

    renderDOM(){
        const container = document.createElement("div");
        const zoneNameP = document.createElement("p");

        zoneNameP.id = "zoneNameP";
        zoneNameP.innerText = this.zoneName;
        zoneNameP.style.textAlign = "center";
        const map = document.createElement("div");
        map.classList.add("grid");
        map.id = "grid";

        container.appendChild(zoneNameP);
        container.appendChild(map);

        return container;
    }
    
    // TODO: DOCS
    drawSeats(rectangles){
        // if (disabledSeats == null)
        //     disabledSeats = [];
        // Set hover animation
        if (this.enableSelecting){
            document.getElementById('grid').classList.add('selectable');
        }
        
        document.getElementById("zoneNameP").innerText = this.zoneName;
        const gridContainer = document.getElementById('grid');
        gridContainer.style.backgroundImage = `url("`+this.backgroundImage+`")`
        
        // set the grid information
        gridContainer.style.aspectRatio = `${rectangles["image_width"]} / ${rectangles["image_height"]}`;
        gridContainer.style.gridTemplateRows = `repeat(${rectangles["image_height"]}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${rectangles["image_width"]}, 1fr)`;

        Object.entries(rectangles["seats"]).forEach(([_, entry]) => {
            const seatNr = entry["id"];
            const gridItem = document.createElement("div");
            gridItem.id = `plaats-${seatNr}`;
            
            gridItem.style.gridRowStart = entry["y"];
            gridItem.style.gridRowEnd = entry["y"] + entry["height"];
            gridItem.style.gridColumnStart = entry["x"];
            gridItem.style.gridColumnEnd = entry["x"] + entry["width"];

            gridItem.style.transform = `rotate(${entry["rotation"]}deg)`;

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
        
        const seatDOM = document.getElementById(`plaats-${parseInt(seatNr)}`);
        if (seatDOM == null)
            throw new Error(`Seat with identifier 'plaats-${seatNr}' was not found.`);

        if (!seatDOM.classList.contains("free") && !forceSelect)
            return;

        this.selectedSeat = seatNr;

        // de-select all other seats
        Array.from(document.getElementsByClassName("selected")).forEach((element) => {
            element.classList.remove("selected")
        });
        // select this element
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
   }

   disable(){
        document.getElementById('grid').classList.remove('selectable');
        this.enableSelecting = false;
   }
}