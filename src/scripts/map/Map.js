/*
Each instance of this class represents a map of a zone with a grid and calculated seat positions.
*/
class Map{
    constructor(zoneId){
        this.zoneId = zoneId;
    }

    renderDOM(){

        return `
        <div class="wapper">
            <img class="image" src="https://images-ext-1.discordapp.net/external/eh3j_XThDdO-4E84sxbucdTFJUAId_wQKi-4xtO6pgw/https/raw.githubusercontent.com/SimonMeersschaut/KURT-PRO/refs/heads/main/resources/maps/Agora_silent_study_2.png?format=webp&quality=lossless&width=1439&height=2035" alt="Background">
            <div class="grid" id="grid">
                <div id="plaats-335" class="booked"></div>
                <div id="plaats-336" class="free"></div>
                <div id="plaats-337" class="free"></div>
                <div id="plaats-312" class="selected"></div>
            </div>
        </div>
        `;
    }
}