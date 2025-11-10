/*
 * Each instance of this class represents a logging object for logging messages, warnings and errors.
 */
class Log{
    /*
    Initializes a new instance.
    */
    constructor(){ }

    /*
    Show an error to the user.
    */
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
    Show a warning to the user.
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
    Log a message to the user.
    */
    log(title, msg){
        console.log(`${title} - ${msg}`);
    }
}