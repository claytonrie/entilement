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
        this.isValid = {
            w: true, a: true,
            s: true, d: true
        };
    }

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
})(-8, -8);
