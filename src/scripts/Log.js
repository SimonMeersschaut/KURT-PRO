/*
 * 
 */
class Log{
    /*
    */
    constructor(){ }

    error(title, msg){
        const popup = new Popup(
            `Error - ${title}`,
            msg,
            "Close"
        );
        popup.show();
    }

    /*
    */
    warn(title, msg){
        const popup = new Popup(
            `Warning - ${title}`,
            msg,
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