const WEEKDAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

/*
Returns a string representation of the classList of the daySelector.

Params:
- selected: if this day is selected in the website
- booked: if this day has a reservation.
- loading: no information is available yet (overwrites some other settings).
*/
function selectorClasses(loading, selected, booked){
    let prefix = selected ? "btn-" : "btn-outline-";

    var color = "";
    if (loading){
        color = "dark";
    }
    else{
        color = booked ? "success" : "primary";
    }
    return "btn " + prefix + color;
}

/*
Each instance of this class represents a header with buttons to select days.
*/
class DaySelector{
    constructor(settingsButton){
        this.settingsButton = settingsButton
        this.selectedDayIndex = 0; // Will index the current selected day (defualt=today)
        this.reservedDays = [false, false, false, false, false, false, false]; // will cache on what days the user has reservations
        this.onClickDay = null; // defautl value
    }

    /*
    This function creates the DOM of a container with day-selectors.
    */
    renderDOM() {
        // Create container
        var selectorContainer = document.createElement("div");
        selectorContainer.id = "daySelectorContainer";
        // Get the day of the week (of today)
        const d = new Date();
        let today = d.getDay();
        for (let i=0; i < 8; i++){
            // calculate the day of the week (monday = 0, ... sunday = 6)
            let weekday = WEEKDAYS[(today+i - 1) % 7];
            var daySelector = this.createDaySelector(i, weekday);
            selectorContainer.appendChild(daySelector);
        }
        if (this.settingsButton){
            var settingsButtonDOM = document.createElement("div");
            settingsButtonDOM.innerText = "settings";
            selectorContainer.appendChild(settingsButtonDOM);
        }
        // return the DOM
        return selectorContainer;
    }

    /*
    This function creates the DOM of one single day-selector-button.
    */
    createDaySelector(dayIndex, weekday){
        const daySelector = document.createElement("div");

        daySelector.id = "daySelector-" + dayIndex.toString()
        daySelector.classList.add("daySelector");
        daySelector.className = selectorClasses(true, null, null);
        daySelector.innerText = weekday[0];

        daySelector.addEventListener("click", (event) => {
            this.selectDay(dayIndex);
        });

        return daySelector;
    }

    selectDay(dayIndex){
        if (dayIndex == this.selectedDayIndex)
            return; // already selected, do nothing

        this.selectedDayIndex = dayIndex;
        this.updateClasses();
        if (this.onClickDay != null){
            this.onClickDay(dayIndex);
        }
    }

    updateClasses(){
        for (let i = 0; i <= 7; i++){
            let daySelector = document.getElementById("daySelector-" + i.toString());
            let selected = (i == this.selectedDayIndex);
            let reserved = this.reservedDays[i]
            daySelector.className = selectorClasses(false, selected, reserved);
        }
    }    
}



