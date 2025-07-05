/*
 * 
 */
class Log{
    /*
    */
    constructor(){ }

    error(title, msg){
        const label = document.createElement("label")
        label.innerText = msg;
        const popup = new Popup(
            `Error - ${title}`,
            label,
            "Close"
        );
        popup.show();
    }

    /*
    */
    warn(title, msg){
        const label = document.createElement("label")
        label.innerText = msg;
        const popup = new Popup(
            `Warning - ${title}`,
            label,
            "Close"
        );
        popup.show();
    }

    /*
    */
    log(title, msg){
        console.log(`${title} - ${msg}`);
    }
}