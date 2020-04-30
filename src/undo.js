const UNDO_MAX = tile.max,
      SCOUt_MAX = Math.max(tile.maxX,tile.maxY);
var undo = {
    // Normal undo
    max: UNDO_MAX,
    steps: new Uint16Array(UNDO_MAX),
    stepCount: 0,
    indices: new Uint16Array(UNDO_MAX),
    types:   new Int8Array(UNDO_MAX),
    tuCount: 0, // Tile update count

    // Scout undo
    sMax: SCOUt_MAX,
    sPosX:  new Uint8Array(SCOUt_MAX),
    sPosY:  new Uint8Array(SCOUt_MAX),
    sTypes: new Int8Array(SCOUt_MAX),
    sCount: 0,
    
    startMove() {
		this.steps[this.stepCount] = this.tuCount;
        this.stepCount += 1;
    },
    
    startScout() {
    	this.sCount = 0;
        player.scout.x = player.to.tar.x;
        player.scout.y = player.to.tar.y;
    },
    
    addTileUpdate(otype, index) {
    	this.indices[this.tuCount] = index;
        this.types[this.tuCount] = otype;
        this.tuCount += 1;
    },
    
    addScoutUpdate(otype, x, y) {
    	this.sPosX[this.sCount] = x;
    	this.sPosY[this.sCount] = y;
        this.sTypes[this.sCount] = otype;
        this.sCount += 1;
    },
    
    undoTurn() {
        if (this.stepCount === 0) {
        	return false;
        }
        this.stepCount -= 1;
        let ind, bx, by;
        while (this.tuCount > this.steps[this.stepCount]) {
        	this.tuCount -= 1;
        	ind = this.indices[this.tuCount];
    		bx = ind % tile.maxX;
        	by = (ind / tile.maxX) | 0;
            tile.setTile(this.types[this.tuCount], 
            	bx, by, false, false);
        }
        player.to.tar.x = 16 * bx + 8;
        player.to.tar.y = 16 * by + 8;
        player.to.resetTransition();
        player.canMove = true;
        return true;
    },
    
    undoScout() {
        let bx, by;
        while (this.sCount > 0) {
        	this.sCount -= 1;
        	bx = this.sPosX[this.sCount];
    		by = this.sPosY[this.sCount];
            //console.log()
            tile.setTile(this.sTypes[this.sCount], 
            	bx, by, false, false, false);
        }
        player.scout.x = player.to.tar.x;
        player.scout.y = player.to.tar.y;
        return true;
    }
};
