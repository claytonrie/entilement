class TransitObj {
    constructor (x, y, tx = x, ty = y, vx = 0, vy = 0) {
        // The position of the object in transition
        this.pos = new Vec2(x, y);
        // The target position of the transition
        this.tar = new Vec2(tx, ty);
        // The amount of time the current transition period has taken
        this.time = 0;
        this.slopeVar = new Vec2(null, null);
        // Vector between the initial start point and the target point
        this.distVar = new Vec2(tx - x, ty - y);
        
        // Set up the slope variable
        if (tx === x) {
            this.slopeVar.x = 0;
        } else {
            this.slopeVar.x = vx / (tx - x) + 1 / TO_TIME_DUR;
        }
        if (ty === y) {
            this.slopeVar.y = 0;
        } else {
            this.slopeVar.y = vy / (ty - y) + 1 / TO_TIME_DUR;
        }
        
        this.atTarget = false; // Whether the object is at its desination
    }

    /// Gets the velocity at the current point of time and returns it as a Vec2
    getVel() {
        let velx, vely;
        if (this.time < TO_TIME_DUR) { 
            let EXP = Math.exp(this.time / (this.time - TO_TIME_DUR));
            velx = this.distVar.x * EXP * (this.slopeVar.x - 
                TO_TIME_DUR * (this.slopeVar.x * this.time + 1) / (this.time - TO_TIME_DUR) / (this.time - TO_TIME_DUR));
            vely = this.distVar.y * EXP * (this.slopeVar.y - 
                TO_TIME_DUR * (this.slopeVar.y * this.time + 1) / (this.time - TO_TIME_DUR) / (this.time - TO_TIME_DUR));
        } else {
            velx = vely = 0;
        }
        return new Vec2(velx, vely);
    }
    
    /// Stops the current transition and starts a new one
    resetTransition (atTarget = false) {
        if (!atTarget) {
            let vel = this.getVel();
            this.distVar = this.pos.to(this.tar);
            this.time = 0;
            if (this.distVar.x === 0) {
                this.slopeVar.x = 0;
            } else {
                this.slopeVar.x = vel.x / this.distVar.x + 1 / TO_TIME_DUR;
            }
            if (this.distVar.y === 0) {
                this.slopeVar.y = 0;
            } else {
                this.slopeVar.y = vel.y / this.distVar.y + 1 / TO_TIME_DUR;
            }
        } else {
            this.pos.x = this.tar.x;
            this.pos.y = this.tar.y;
            this.time = TO_TIME_DUR;
        }
        this.atTarget = atTarget;
    }

    /// Calculates one dt millisecond step along the objects transition
    smoothTransition (dt) {
        if (this.time >= TO_TIME_DUR) {
            this.resetTransition(true);
        } else {
            let EXP = Math.exp(this.time / (this.time - TO_TIME_DUR));
            let newX = this.distVar.x * (this.slopeVar.x * this.time + 1) * EXP,
                newY = this.distVar.y * (this.slopeVar.y * this.time + 1) * EXP;
            this.pos.x = this.tar.x - newX; this.pos.y = this.tar.y - newY;
            this.time += dt;
        }
    }
}

var player = {
    // Variables
    to: new TransitObj(-8, -8),
    canMove: true,
    onDiagonal: false,
    scoutResult: {
        up:   SCOUT_CODE.VALID, down:  SCOUT_CODE.VALID,
        left: SCOUT_CODE.VALID, right: SCOUT_CODE.VALID
    },
    scout: new Vec2(), // Scouting position

    // Methods
    moveDirection (dir) {
        // Check to see if the direction is 
        if (dir.x === 0) {
            if (dir.y === -1) {
                if (this.scoutResult.up === SCOUT_CODE.INVALID) { return false; }
            } else if (dir.y === 1) {
                if (this.scoutResult.down === SCOUT_CODE.INVALID) { return false; }
            }
        } else if (dir.x === -1) {
            if (this.scoutResult.left === SCOUT_CODE.INVALID) { return false; }
        } else if (dir.x === 1) {
            if (this.scoutResult.right === SCOUT_CODE.INVALID) { return false; }
        } else {
            throw new Error(`Invalid direction: ${dir}`);
        }
        // Set-up undo
        undo.startMove();
        // Run tile-type-based scripts
        tile.onStep(tile.getTile(this.to.tar.x, this.to.tar.y), dir);
        let ret = tile.onLand(tile.getTile(this.to.tar.x, this.to.tar.y), dir);
        // Record whether we are on a diagonal tile
        if (ret < 0) { this.onDiagonal = true; }
        else { this.onDiagonal = false; }
        // Return the tile land value
        return ret;
    },
    
    scoutAllMoves () {
    	let dir = new Vec2();
        undo.startScout();
        dir.y = -1; this.scoutResult.up    = this.scoutMove(dir);
        dir.y =  1; this.scoutResult.down  = this.scoutMove(dir);
        dir.y =  0;
        dir.x = -1; this.scoutResult.left  = this.scoutMove(dir);
        dir.x =  1; this.scoutResult.right = this.scoutMove(dir);
    },
    
    scoutMove (dir) {
        let ret = tile.onStepScout(tile.getTile(this.scout.x, this.scout.y), dir);
        if (!ret) {
            undo.undoScout();
            return SCOUT_CODE.INVALID;
        }
        ret = tile.onLandScout(tile.getTile(this.scout.x, this.scout.y), dir);
        undo.undoScout();
        return ret;
    },
    
    die () { this.canMove = false; },

    draw () {
        // draw a light circle at the destination
        if (!this.to.atTarget) {
            drawer.setLineWidth(1).setColor("#FFF");
            drawer.drawCirc(true, this.to.tar, 7, 0.5);
        }
        
        // draw the player at their appearing position
        drawer.color = "#FFF";
        drawer.drawCirc(false, this.to.pos, 7, 0.333);
        drawer.setLineWidth(3).setColor("yellow")
        drawer.drawCirc(true, this.to.pos, 7);
    }
};
