const WEEKDAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

// Initialize some variables
var selectedDayIndex = 0; // Will index the current selected day (defualt=today)
var reservedDays = [false, false, false, false, false, false, false]; // will cache on what days the user has reservations

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

function fetchReservations(){
    fetch("https://kurt3.ghum.kuleuven.be/api/reservations")
    .then(response => response.json())
    .then(data => {
        var d = new Date();
        data.forEach(reservation => {
            var date = new Date(reservation["startDate"]);
            let dayIndex = date.getDay() - d.getDay();
            if (0 <= dayIndex <= 6){
                reservedDays[dayIndex] = true;
            }
        });
        // update the selectors with this new information
        updateSelectors();
    })
    
}

/*
This function creates the DOM of one single day-selector-button.
*/
function createDaySelector(dayIndex, weekday, onUpdate){
    const daySelector = document.createElement("div");

    daySelector.id = "daySelector-" + dayIndex.toString()
    daySelector.classList.add("daySelector");
    daySelector.className = selectorClasses(true, null, null);
    daySelector.innerText = weekday[0];

    daySelector.addEventListener("click", (event) => {
        selectDay(dayIndex);
        onUpdate(dayIndex);
    });

    return daySelector;
}

function updateSelectors(){
    for (let i = 0; i <= 7; i++){
        let daySelector = document.getElementById("daySelector-" + i.toString());
        let selected = (i == selectedDayIndex);
        let reserved = reservedDays[i]
        daySelector.className = selectorClasses(false, selected, reserved);
    }
}

function selectDay(dayIndex){
    selectedDayIndex = dayIndex;
    updateSelectors();
}

/*
This function creates the DOM of a container with day-selectors
*/
function createDaySelectors(onUpdate) {
    // Create container
    var selectorContainer = document.createElement("div");
    selectorContainer.id = "daySelectorContainer";
    // Get the day of the week (of today)
    const d = new Date();
    let today = d.getDay();
    for (let i=0; i < 8; i++){
        // calculate the day of the week (monday = 0, ... sunday = 6)
        let weekday = WEEKDAYS[(today+i - 1) % 7];
        var daySelector = createDaySelector(i, weekday, onUpdate);
        selectorContainer.appendChild(daySelector);
    }
    // return the DOM
    return selectorContainer;
}