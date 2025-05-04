const MAX_DAYCACHE_TIME = 1 * 60 * 60 * 1000; // one hour caches

class DayCache{
    constructor(){
        // update time may only be set when the entire content has been updated
        this.zoneCaches = {};
    }

    /*
    Returns the zoneCache with the `zoneId`.
    If the zoneId is not found, it creates a new zoneCache.
    */
    getZoneCache(zoneId){
        if (this.zoneCaches[zoneId] == undefined){
            // no cache found (yet)
            // create a new one
            this.zoneCaches[zoneId] = new ZoneCache();
        }
        const cache = this.zoneCaches[zoneId];
        if (cache == undefined) 
            throw new Error("`zoneCache` cannot be `null`.");
        return cache;
    }
    
    isValid(){
        if (this.updateTime == null)
            // not set yet
            return false;

        return new Date().getTime() - this.updateTime.getTime() <= MAX_DAYCACHE_TIME;
    }

    setValid(){
        this.updateTime = new Date();
    }
}


class ZoneCache{
    constructor(){
        // update time may only be set when the entire content has been updated
        this.updateTime = null;
        this.content = [];
    }
    
    isValid(){
        if (this.updateTime == null)
            // not set yet
            return false;

        return new Date().getTime() - this.updateTime.getTime() <= MAX_DAYCACHE_TIME;
    }

    setValid(){
        this.updateTime = new Date();
    }

    push(item){
        // check that the item is not already in the list
        if (!this.content.some(x => x.id == item.id))
            // add the item
            this.content.push(item);
    }
}