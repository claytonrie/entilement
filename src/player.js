const TMULT = 256;
class TransitObj {
    constructor (x, y, tx = x, ty = y, vx = 0, vy = 0) {
        const TIME_DUR = 256;
        this.pos = new Vec2(x, y);
        this.tar = new Vec2(tx, ty);
        this.time = 0;
        this.slopeVar = new Vec2(null, null);
        this.distVar = new Vec2(tx - x, ty - y);
        if (tx === x) {
            this.slopeVar.x = 0;
        } else {
            this.slopeVar.x = vx / (tx - x) + 1 / TIME_DUR;
        }
        if (ty === y) {
            this.slopeVar.y = 0;
        } else {
            this.slopeVar.y = vy / (ty - y) + 1 / TIME_DUR;
        }
        this.atTarget = false;
    }

    getVel() {
        const TIME_DUR = 256;
        let velx, vely;
        if (this.time < TIME_DUR) { 
            let EXP = Math.exp(this.time / (this.time - TIME_DUR));
            velx = this.distVar.x * EXP * (this.slopeVar.x - 
                TIME_DUR * (this.slopeVar.x * this.time + 1) / (this.time - TIME_DUR) / (this.time - TIME_DUR));
            vely = this.distVar.y * EXP * (this.slopeVar.y - 
                TIME_DUR * (this.slopeVar.y * this.time + 1) / (this.time - TIME_DUR) / (this.time - TIME_DUR));
        } else {
            velx = vely = 0;
        }
        return new Vec2(velx, vely);
    }
    
    resetTransition (atTarget = false) {
        const TIME_DUR = 256;
        if (!atTarget) {
            let vel = this.getVel();
            this.distVar = this.pos.to(this.tar);
            this.time = 0;
            if (this.distVar.x === 0) {
                this.slopeVar.x = 0;
            } else {
                this.slopeVar.x = vel.x / this.distVar.x + 1 / TIME_DUR;
            }
            if (this.distVar.y === 0) {
                this.slopeVar.y = 0;
            } else {
                this.slopeVar.y = vel.y / this.distVar.y + 1 / TIME_DUR;
            }
        } else {
            this.pos.x = this.tar.x;
            this.pos.y = this.tar.y;
            this.time = TIME_DUR;
        }
        this.atTarget = atTarget;
    }

    smoothTransition (dt) {
        const TIME_DUR = 256;
        if (this.time >= TIME_DUR) {
            this.resetTransition(true);
        } else {
            let EXP = Math.exp(this.time / (this.time - TIME_DUR));
            let newX = this.distVar.x * (this.slopeVar.x * this.time + 1) * EXP,
                newY = this.distVar.y * (this.slopeVar.y * this.time + 1) * EXP;
            this.pos.x = this.tar.x - newX; this.pos.y = this.tar.y - newY;
            this.time += dt;
        }
    }
}

var player = new (class extends TransitObj {
    constructor (x = 0, y = 0) {
        super(x, y);
        this.canMove = true;
        this.scoutResult = {
            up:   SCOUT_CODE.VALID, down:  SCOUT_CODE.VALID,
            left: SCOUT_CODE.VALID, right: SCOUT_CODE.VALID
        };
        this.scout = new Vec2(); // Scouting position
        // this.currDisp = 0;
        // this.moveDisp = 0;
        // this.displayMoves = false;
        // this.prevMoves = "";
        // this.currMoves = "";
    }

    moveDirection (dir) {
        if (dir.x === 0) {
            if (dir.y === -1) {
                if (this.scoutResult.up === SCOUT_CODE.INVALID) { return false; }
                //this.currMoves += "w";
            } else if (dir.y === 1) {
                if (this.scoutResult.down === SCOUT_CODE.INVALID) { return false; }
                //this.currMoves += "s";
            }
        } else if (dir.x === -1) {
            if (this.scoutResult.left === SCOUT_CODE.INVALID) { return false; }
            //player.currMoves += "a";
        } else if (dir.x === 1) {
            if (this.scoutResult.right === SCOUT_CODE.INVALID) { return false; }
           //player.currMoves += "d";
        }
        UndoHandler.startMove();
        Tile.onStep(tiles.getTile(this.tar.x, this.tar.y), dir);
        return Tile.onLand(tiles.getTile(this.tar.x, this.tar.y), dir);
    }
    
    scoutAllMoves () {
    	let dir = new Vec2();
        UndoHandler.startScout();
        dir.y = -1; this.scoutResult.up    = this.scoutMove(dir);
        dir.y =  1; this.scoutResult.down  = this.scoutMove(dir);
        dir.y =  0;
        dir.x = -1; this.scoutResult.left  = this.scoutMove(dir);
        dir.x =  1; this.scoutResult.right = this.scoutMove(dir);
    }
    
    scoutMove (dir) {
        Tile.onStepScout(tiles.getTile(this.scout.x, this.scout.y), dir);
        let ret =  Tile.onLandScout(tiles.getTile(this.scout.x, this.scout.y), dir);
        UndoHandler.undoScout();
        return ret;
    }
    
    /*handlePreviousMoves() {
        if (this.displayMoves) {
            if (key.isBuffered(KEY.DISP_UP)) {
                key.useBuffer(KEY.DISP_UP);
                if (this.moveDisp > 0) {
                    this.moveDisp -= 1;
                }
            } else if (key.isBuffered(KEY.DISP_DOWN)) {
                key.useBuffer(KEY.DISP_DOWN);
                if (this.prevMoves.length > 16 && 
                        this.prevMoves.length - this.moveDisp > 16) {
                    this.moveDisp += 1;
                }
            }
        } else {
            key.useBuffer(KEY.DISP_UP, KEY.DISP_DOWN);
            this.moveDisp = 0;
        }
        if (key.isBuffered(KEY.DISP)) {
            key.useBuffer(KEY.DISP);
            this.displayMoves = !this.displayMoves;
        }
    }*/
    
    die () {
        this.canMove = false;
    }

    draw () {
        if (!this.atTarget) {
            Drawer.setLineWidth(1).setColor("#FFF");
            Drawer.drawCirc(true, this.tar, 7, 0.5);
        }
        
        Drawer.color = "#FFF";
        Drawer.drawCirc(false, this.pos, 7, 0.333);
        Drawer.setLineWidth(3).setColor("yellow")
        Drawer.drawCirc(true, this.pos, 7);
    }
    
    /*drawPreviousMoves (op = 1, dt = 0) {
        if (this.displayMoves) {
            const DEL = dt * Math.ceil(Math.abs(this.currDisp - this.moveDisp)) / 256;
            if (this.currDisp + DEL < this.moveDisp) {
                this.currDisp += DEL;
            } else if (this.currDisp < this.moveDisp) {
                this.currDisp = this.moveDisp;
            }
            if (this.currDisp - DEL > this.moveDisp) {
                this.currDisp -= DEL;
            } else if (this.currDisp > this.moveDisp) {
                this.currDisp = this.moveDisp;
            }
            
            let temp = Drawer.op, MD = this.currDisp | 0;
            Drawer.op = op;
            Drawer.setColor("#000")
                .drawRect(false, 256 - 16, 0, 16, 256, 0.5);
            let i = this.prevMoves.length > 17 ? 16 :
                (this.prevMoves.length - 1);
            for (; i > 0; i -= 1) {
                if (MD + i + 1 === this.prevMoves.length) {
                    Drawer.color = "#E00";
                } else {
                    Drawer.color = "#FFF";
                }
                if (i === 16) {
                    Drawer.op = op * (this.currDisp % 1);
                } else {
                    Drawer.op = op;
                }
                Drawer.directionTriangle(false, this.prevMoves[MD + i],
                    256 - 8, 8 + 16 * i - 16 * (this.currDisp % 1), 10);
            }
            if (MD === 0) { Drawer.color = "#EE0"; }
            Drawer.op = op * (1 - (this.currDisp % 1));
            Drawer.customTriangle(false, this.prevMoves[MD],
                256 - 8, 8 - 16 * (this.currDisp % 1), 10);
            Drawer.op = temp;
        }
    }*/
})(-8, -8);
