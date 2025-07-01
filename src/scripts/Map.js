/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(locationId, zoneId, zoneName){
        if (locationId == null) throw new Error("locationId was null");
        if (zoneId == null) throw new Error("zoneId was null");
        if (zoneName == null) throw new Error("zoneName was null");
        this.locationId = locationId;
        this.zoneName = zoneName;
        this.zoneId = zoneId;
        this.dom = null;
        this.backgroundImage = `https://github.com/SimonMeersschaut/KURT-PRO/blob/main/resources/maps/zones/`+this.zoneId+`/map.png?raw=true`
        this.initialized = false; // will be set on true when the map is loaded initially
        this.reservationData = null;
    }

    renderDOM(){
        this.dom = document.createElement("div");
        const zoneNameP = document.createElement("p");

        zoneNameP.id = "zoneNameP";
        zoneNameP.innerText = this.zoneName;
        zoneNameP.style.textAlign = "center";
        const map = document.createElement("div");
        map.classList.add("grid");
        map.id = "grid";

        this.dom.appendChild(zoneNameP);
        this.dom.appendChild(map);
        // fetch and display seats
        this.fetchMapData(this.locationId, this.zoneId, selectedDay, 8, 10); // FIXME change to clock
        return this.dom;
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
                this.drawSeats(mapData, zoneId, startTime, endTime);
                this.initialized = true;
            }
 
            if (this.initialized){
                // remove all 'free' classes
                const freeSeats = this.dom.getElementsByClassName("free");
                for (let i=0; i<freeSeats.length; i++){
                    freeSeats[i].classList.remove("free");
                }
                // remove the selected seat(s)
                const selectedSeats = this.dom.getElementsByClassName("selected");
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
                        const seatDOM = this.dom.querySelector(`#plaats-${seatInfo["seatNr"]}`)
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

    // TODO: DOCS
    drawSeats(rectangles, zoneId, startTimeHours, endTimeHours){
        this.dom.querySelector('#grid').classList.add('selectable');
        
        this.dom.querySelector("#zoneNameP").innerText = this.zoneName;
        const gridContainer = this.dom.querySelector('#grid');
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

        if (this.reservationData == null){
            // no reservation
            var selectedSeatCard = new SelectedSeatCard([
                new Button(
                    1, // type
                    "Book", // text
                    (seatNr, seatId, startTimeHours, endTimeHours) => {
                        // effectively book that seat
                        // updates the tunnel cache too!
                        bookSeat(zoneId, this.zoneName, seatId, seatNr, selectedDay, startTimeHours, endTimeHours)
                        .then((success) => {
                            if (success){
                                // update the page
                                selectDay(document.getElementById("main"));
                            }
                            else{
                                // error
                                throw new Error("An error occured while booking the seat. Please check the console for more details.");
                            }
                        })
                    }
                )
            ], startTimeHours, endTimeHours);
            // selectedSeatCard.setSeatTime(startTimeHours, endTimeHours);
            this.dom.appendChild(selectedSeatCard.renderDOM());
            // event listeners
            this.onSelectSeat = (seatNr, seatId) => {selectedSeatCard.setSeat(seatNr, seatId)};
        }
        else{
            // reservation
            this.dom.querySelector('#grid').classList.remove("selectable");
            // show a information card
            const _startTimeHours = parseInt(this.reservationData.startTime.split(":")[0]);
            const _endTimeHours = parseInt(this.reservationData.endTime.split(":")[0]);
            var selectedSeatCard = new SelectedSeatCard([
                new Button(
                    1, // type
                    "Change", // text
                    () => {window.location.assign(`/edit-reservation/${this.reservationData["id"]}`);} // go to the page to edit the reservation
                ),
                new Button(
                    2, // type
                    "Cancel", // text
                    () => {window.location.assign(`/reservations`);} // manage all reservations
                ),
            ], _startTimeHours, _endTimeHours);
            this.dom.appendChild(selectedSeatCard.renderDOM());
            // show reserved seat
            selectedSeatCard.setTitle(this.reservationData["seatNr"]);
            const seatDOM = this.dom.querySelector(`#plaats-${this.reservationData["seatNr"]}`);
            seatDOM.style.backgroundColor = "#00ff1ac5";
            seatDOM.disabled = true;
            // event listener
            this.onSelectSeat = (seatNr, seatId) => {};
        }
    }

    /*
    Handle the user clicking on a seat.
    */
    handleSeatClick(seatNr){
        const seatDOM = this.dom.querySelector(`#plaats-${parseInt(seatNr)}`);
        if (seatDOM == null)
            throw new Error(`Seat with identifier 'plaats-${seatNr}' was not found.`);

        if (!seatDOM.classList.contains("free"))
            return;

        this.selectedSeat = seatNr;

        // de-select all other seats
        Array.from(this.dom.getElementsByClassName("selected")).forEach((element) => {
            element.classList.remove("selected")
        });
        // select this element
        seatDOM.classList.add("selected");

        // get the seat Id
        const seatId = seatDOM.getAttribute("seatId");

        // Call event listener
        this.onSelectSeat(seatNr, seatId);
    }


    showReservation(reservationData){
        this.reservationData = reservationData;
        // 
        // 
        // clock.setText(`${startTimeHours}:00 - ${endTimeHours}:00`);
        // clock.disable();

        
        
        // Render new DOM
        // mainContainer.appendChild(map.renderDOM());
        // mainContainer.appendChild(selectedSeatCard.renderDOM());
        // selectedSeatCard.setSeat(reservationData.seatNr, null);
        // selectedSeatCard.startTimeHours = startTimeHours;
        // selectedSeatCard.endTimeHours = endTimeHours;
        // selectedSeatCard.updateSeatTime();

        // tunnel.fetchMapData(zone_id)
        // .then(mapData => {
        //     map.drawSeats(mapData);
        //     map.handleSeatClick(seatNr=reservationData.seatNr, forceSelect=true);
        // })
    }
}