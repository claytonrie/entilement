const MOVE_IND_MAX = 4 * 4;
var moveInd = {
    max: MOVE_IND_MAX,
    length: 0,
    time: new Uint16Array(MOVE_IND_MAX),
    ph: new Uint8Array(MOVE_IND_MAX),
    clr: new Uint8Array(MOVE_IND_MAX),
    to: [],
    
    findTargetting(x, y) {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.to[i].tar.x === x && this.to[i].tar.y === y) {
                return this.to[i];
            }
        }
        return {pos: new Vec2(x, y), getVel: i => new Vec2()};
    },
    
    create (len, pos, phase = 3, cpos = pos, quadruple = true, vel = new Vec2()) {
        if (quadruple) {
            if (len < 0) {
                this.createDiag(len, pos, phase, cpos, vel);
            } else if (len > 256) {
                this.createYellow(pos, phase, cpos, vel);
            } else {
                this.createOrtho(len, pos, phase, cpos, vel);
            }
        } else {
            this.to.push(new TransitObj(pos.x, pos.y, cpos.x, cpos.y, vel.x, vel.y));
            this.time[this.length] = 0; this.ph[this.length] = phase;
            this.clr[this.length] = SCOUT_CODE.VALID;
            this.length += 1;
        }
        return true;
    },
    
    createOrtho (len, pos, phase, cpos, vel) {
        this.to.push(new TransitObj(pos.x, pos.y, cpos.x + 16 * len,
                cpos.y, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.right;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x - 16 * len,
                cpos.y, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.left;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x, cpos.y + 16 * len,
                vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.down;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x, cpos.y - 16 * len,
                vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.up;
        this.length += 1;
    }
    
    static createDiag(len, pos, phase, cpos, vel) {
        this.to.push(new TransitObj(pos.x, pos.y, cpos.x - 16 * len,
                cpos.y - 16 * len, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.right;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x - 16 * len,
                cpos.y + 16 * len, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.left;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x + 16 * len,
                cpos.y - 16 * len, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.down;
        this.length += 1;

        this.to.push(new TransitObj(pos.x, pos.y, cpos.x + 16 * len,
                cpos.y + 16 * len, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.up;
        this.length += 1;
    }
    
    static createYellow(pos, phase, cpos, vel) {
        let res;
        res = 16 * tile.searchHorz(cpos.x + 16, cpos.y, false) + 8;
        this.to.push(new TransitObj(pos.x, pos.y, res, cpos.y, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.right;
        this.length += 1;

        res = 16 * tile.searchHorz(cpos.x - 16, cpos.y, true) + 8;
        this.to.push(new TransitObj(pos.x, pos.y, res, cpos.y, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.left;
        this.length += 1;

        res = 16 * tile.searchVert(cpos.x, cpos.y + 16, false) + 8;
        this.to.push(new TransitObj(pos.x, pos.y, cpos.x, res, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.down;
        this.length += 1;

        res = 16 * tile.searchVert(cpos.x, cpos.y - 16, true) + 8;
        this.to.push(new TransitObj(pos.x, pos.y, cpos.x, res, vel.x, vel.y));
        this.time[this.length] = 0; this.ph[this.length] = phase;
        this.clr[this.length] = player.scoutResult.up;
        this.length += 1;
    }
    
    clear () {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.ph[i] < MOVE_IND_PHASE.FADE_OUT) {
                this.ph[i] = MOVE_IND_PHASE.FADE_OUT;
                this.time[i] = 0;
            }
        }
    },
    
    refreshMove (len) {
        this.clear();
        if (len) {
            let moveTo = this.findTargetting(player.to.tar.x, player.to.tar.y);
            this.create(len, moveTo.pos, 3, player.to.tar, new Vec2(),
                moveTo.getVel());
        }
    },
    
    static advanceDraw(dt, ind) {
        this.time[ind] += dt;
        let op = 1;
        let x  = this.to[ind].pos.x, y  = this.to[ind].pos.y,
            tx = this.to[ind].tar.x, ty = this.to[ind].tar.y;
        if (this.ph[ind] === MOVE_IND_PHASE.FADE_IN) { // Fade in
            op = this.time[ind] / 512;
            if (op > 1) {
                op = 1;
                this.ph[ind] = MOVE_IND_PHASE.STAY;
            }
            if (op < 0) op = 0;
        } else if (this.ph[ind] === MOVE_IND_PHASE.SPLIT) { // Splitting
            op = (this.time[ind] / 128) + 0;
            if (op < 0) op = 0;
            if (op > 1) op = 1;
            this.to[ind].smoothTransition(dt);
            if (this.to[ind].atTarget) {
                this.ph[ind] = MOVE_IND_PHASE.STAY;
            }
            x = this.to[ind].pos.x;
            y = this.to[ind].pos.y;
        } else if (this.ph[ind] === MOVE_IND_PHASE.FADE_OUT) { // Fade out
            op = 1 - this.time[ind] / 128;
            if (op < 0) {
                op = 0;
                this.ph[ind] = MOVE_IND_PHASE.DELETE;
            }
        } else if (this.ph[ind] === MOVE_IND_PHASE.DELETE) { // Die
            this.length -= 1;
            let TO = this.to.pop();//(this.length, 1);
            if (ind < this.length) {
                this.to[ind] = TO;
                this.time[ind] = this.time[this.length];
                this.clr[ind] = this.clr[this.length];
                this.ph[ind] = this.ph[this.length];
            }
            return;
        }
        Drawer.color = MOVE_IND_COLOR[this.clr[ind]];
        Drawer.drawCirc(false, x, y, 3, 0.5 * op);
    },    
    
    drawAll(dt) {
        let i = this.length - 1;
        Drawer.color = "#FFF";
        for (; i >= 0; i -= 1) {
            this.advanceDraw(dt, i);
        }
    }
};
