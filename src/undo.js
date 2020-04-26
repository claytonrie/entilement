var UndoHandler = new (class {
	constructor (max, sMax) {
    	// Normal undo
    	this.max = max;
        this.steps = new Uint16Array(max);
        this.stepCount = 0;
        this.indices = new Uint16Array(2 * max);
        this.types   = new Int8Array(2 * max);
        this.tuCount = 0; // Tile update count
        
        // Scout undo
        this.sMax = sMax;
        this.sPosX  = new Uint8Array(sMax);
        this.sPosY  = new Uint8Array(sMax);
        this.sTypes = new Int8Array(sMax);
        this.sCount = 0;
    }
    
    startMove() {
		this.steps[this.stepCount] = this.tuCount;
        this.stepCount += 1;
    }
    
    startScout() {
    	this.sCount = 0;
        player.scout.x = player.tar.x;
        player.scout.y = player.tar.y;
    }
    
    addTileUpdate(otype, index) {
    	this.indices[this.tuCount] = index;
        this.types[this.tuCount] = otype;
        this.tuCount += 1;
    }
    
    addScoutUpdate(otype, x, y) {
    	this.sPosX[this.sCount] = x;
    	this.sPosY[this.sCount] = y;
        this.sTypes[this.sCount] = otype;
        this.sCount += 1;
    }
    
    undoTurn() {
        if (this.stepCount === 0) {
        	return false;
        }
        this.stepCount -= 1;
        let ind, bx, by;
        while (this.tuCount > this.steps[this.stepCount]) {
        	this.tuCount -= 1;
        	ind = this.indices[this.tuCount];
    		bx = ind % tiles.maxX;
        	by = (ind / tiles.maxX) | 0;
            tiles.setTile(this.types[this.tuCount], 
            	bx, by, false, false);
        }
        player.tar.x = 16 * bx + 8;
        player.tar.y = 16 * by + 8;
        player.resetTransition();
        player.canMove = true;
        return true;
    }
    
    undoScout() {
        let bx, by;
        while (this.sCount > 0) {
        	this.sCount -= 1;
        	bx = this.sPosX[this.sCount];
    		by = this.sPosY[this.sCount];
            //console.log()
            tiles.setTile(this.sTypes[this.sCount], 
            	bx, by, false, false, false);
        }
        player.scout.x = player.tar.x;
        player.scout.y = player.tar.y;
        return true;
    }
})(tiles.max, 16);
