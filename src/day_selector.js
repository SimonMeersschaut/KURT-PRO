const WEEKDAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

function createDaySelector(dayIndex, weekday){
    var daySelector = document.createElement("div");

    daySelector.classList.add("daySelector");
    if (dayIndex == 0){
        // selected
        daySelector.classList.add("btn-primary");
    }
    else{
        daySelector.classList.add("btn-outline-primary");
    }
    daySelector.id = "daySelector-" + dayIndex.toString()
    daySelector.classList.add("btn");
    daySelector.innerText = weekday[0];
    return daySelector;
}


function createDaySelectors() {
    // Create container
    var selectorContainer = document.createElement("div");
    selectorContainer.id = "daySelectorContainer";
    // Get the day of the week (of today)
    const d = new Date();
    let today = d.getDay();
    for (let i=0; i < 8; i++){
        // calculate the day of the week (monday = 0, ... sunday = 6)
        let weekday = WEEKDAYS[(today+i - 1) % 7];
        var daySelector = createDaySelector(i, weekday);
        selectorContainer.appendChild(daySelector);
    }
    // Fetch future reservations and update the selectors
    // update_selectors_with_
    return selectorContainer;
}