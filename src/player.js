var player = new (class {
    constructor (x = 0, y = 0) {
        this.pos = new Vec2(x, y);
        this.tar = new Vec2(x + 64, y + 32);
        this.vel = new Vec2(2 * Math.random() - 1, 0);
        this.acc = new Vec2(0, 0);
        this.slopeVar = new Vec2(null, null);
        this.slopeCounter = new Vec2(null, null);
        this.atTarget = false;
        return this;
    }

    move (dt) {
        this.pos.addEq(Vec2.scAddSc(dt / TMULT, this.vel,
            (dt * dt) / (2 * TMULT * TMULT), this.acc));
        this.vel.addEq(this.acc.scale(dt / TMULT));
    }

    resetTransition (atTarget = false) {
        this.slopeVar.x = null; this.slopeVar.y = null;
        this.slopeCounter.x = null;
        this.slopeCounter.y = null;
        this.atTarget = atTarget;
    }

    smoothTransition (dt) {
        if (Vec2.sqDist(this.pos, this.tar) < 1) {
            this.vel.x = this.vel.y = 0;
            this.acc.x = this.acc.y = 0;
            this.pos.x = this.tar.x;
            this.pos.y = this.tar.y;
            this.resetTransition(true);
        } else {
            const time = 500 / TMULT / 8;
            let dist = this.pos.to(this.tar);
            let vx = this.vel.x, vy = this.vel.y;
            if (typeof this.slopeVar.x !== "number") {
                let slope = Math.abs(vx / dist.x) + (1 / time);
                this.slopeVar.x = isNaN(slope) ? 0 : slope;
                slope = Math.abs(vy / dist.y) + (1 / time);
                this.slopeVar.y = isNaN(slope) ? 0 : slope;
                this.slopeCounter.x = 1; this.slopeCounter.y = 1;
            }
            if (Math.abs(dist.x) < 0.5) {
                this.acc.x = 0;
                this.vel.x = 0;
            } else {
                let basex = vx - this.slopeVar.x * dist.x / this.slopeCounter.x;
                let divx = Math.abs(basex / dist.x);
                let accx = (2 * Math.sqrt(divx / time) - divx +
                    (2 * this.slopeVar.x / this.slopeCounter.x)) * basex;
                this.acc.x = isNaN(accx) ? 0 : -accx;
            }
            if (Math.abs(dist.y) < 0.5) {
                this.acc.y = 0;
                this.vel.y = 0;
            } else {
                let basey = vy - this.slopeVar.y * dist.y / this.slopeCounter.y;
                let divy = Math.abs(basey / dist.y);
                let accy = (2 * Math.sqrt(divy / time) - divy +
                    (2 * this.slopeVar.y / this.slopeCounter.y)) * basey;
                this.acc.y = isNaN(accy) ? 0 : -accy;
            }
            this.slopeCounter.addEq(this.slopeVar.scale(dt / TMULT));
        }
    }

    die () {
        level.load(level.current);
    }

    draw () {
        ctx.beginPath();
        ctx.moveTo(this.pos.x + 5, this.pos.y);
        ctx.arc(this.pos.x, this.pos.y, 5, 0, 6.28318531);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "yellow";
        ctx.fillStyle = "#FFF";
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        if (!this.atTarget) {
            ctx.beginPath();
            ctx.moveTo(this.tar.x + 6, this.tar.y);
            ctx.arc(this.tar.x, this.tar.y, 6, 0, 6.28318531);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FFF";
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
})(8, 8);
