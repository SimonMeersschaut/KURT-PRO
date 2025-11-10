export default function getZoneId(name, nr){
    if (name.startsWith("CBA - Zolder Seat "))
        return 14;
    else if (name.startsWith("Agora - Silent Study Seat ")){
        if (nr < 200)
            return 1;
        else
            return 2;
    }
    else if (name.startsWith("CBA - Boekenzaal Seat "))
        return 11;
    else throw new Error(`Identifier of zone '${name}' was not found. (seatNr: ${nr})`);
}