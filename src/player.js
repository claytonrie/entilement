const TMULT = 256;
class TransitObj {
    constructor (x, y, tx = x, ty = y, vx = 0, vy = 0) {
        this.pos = new Vec2(x, y);
        this.tar = new Vec2(tx, ty);
        this.time = 0;
        this.slopeVar = new Vec2(null, null);
        this.distVar = new Vec2(null, null);
        this.atTarget = false;
    }
    
    move (dt) {
        // TODO: Remove
    }

    resetTransition (atTarget = false) {
        const TIME_DUR = 256;
        if (!atTarget) {
            let velx, vely;
            if (this.time < TIME_DUR) { 
                let EXP = Math.exp(1 + TIME_DUR / (this.time - TIME_DUR));
                velx = this.distVar.x * EXP * (this.slopeVar.x - 
                    TIME_DUR * (this.slopeVar.x * this.pos.x + 1) / (this.pos.x - TIME_DUR) / (this.pos.x - TIME_DUR));
                vely = this.distVar.y * EXP * (this.slopeVar.y - 
                    TIME_DUR * (this.slopeVar.y * this.pos.y + 1) / (this.pos.y - TIME_DUR) / (this.pos.y - TIME_DUR));
            } else {
                velx = vely = 0;
            }
            this.distVar = this.pos.to(this.tar);
            this.time = 0;
            this.slopeVar.x = velx / this.distVar.x + 1 / TIME_DUR;
            this.slopeVar.y = vely / this.distVar.y + 1 / TIME_DUR;
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
            let disp = this.pos.to(this.tar), EXP = Math.exp(1 + TIME_DUR / (this.time - TIME_DUR));
            let newX = this.distVar.x * (this.slopeVar.x * disp.x + 1) * EXP,
                newY = this.distVar.y * (this.slopeVar.y * disp.y + 1) * EXP;
            this.pos.x = newX; this.pos.y = newY;
            this.time += dt;
        }
    }
}

var player = new (class extends TransitObj {
    constructor (x = 0, y = 0) {
        super(x, y);
    }

    die () {
        Game.mode = 3;
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
})(-8, -8);
