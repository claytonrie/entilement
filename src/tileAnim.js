var tileAnim = {
    type: new Uint8Array(TILE_MAX),
    x: new Int16Array(TILE_MAX), y: new Int16Array(TILE_MAX),
    time: new Uint16Array(TILE_MAX),
    length: 0,
    
    animate: [],
    
    create (type, x, y) {
        this.type[this.length] = type;
        this.x[this.length] = x;
        this.y[this.length] = y;
        this.time[this.length] = 0;
        this.length += 1;
        return true;
    },

    advanceDraw(dt, ind) {
        this.time[ind] += dt;
        if (this.animate[this.type[ind]](dt, ind)) {
            // Delete tile animation if done
            this.length -= 1;
            if (ind < this.length) {
                this.type[ind] = this.type[this.length];
                this.x[ind] = this.x[this.length];
                this.y[ind] = this.y[this.length];
                this.time[ind] = this.time[this.length];
            }
            return false;
        }
        return true;
    },

    shrink (dt, ind, color)  {
        let shrink = this.time[ind] / 64;
        if (shrink >= 8) { return true; }
        drawer.setLineWidth(3 / shrink).setColor(color);
        drawer.drawRect(true, this.x[ind] + shrink, this.y[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink);
        return false;
    },
    shrinkFill (dt, ind, color)  {
        let shrink = this.time[ind] / 64;
        if (shrink >= 8) { return true; }
        drawer.setLineWidth(3 / shrink).setColor(color);
        drawer.drawRect(false, this.x[ind] + shrink, this.y[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink, 0.5);
        drawer.drawRect(true, this.x[ind] + shrink, this.y[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink);
        return false;
    },
    
    RNG (x, y, seed, max) {
        // TODO: make an actual peudoRNG generator
        //   This one does a bunch of shit to the numbers to obscure the result, but it probably has some big bias
    	let X1 = x / 16 + 0.1725 * seed * y / 4 + 3.4, X2 = y / 16 + 0.096 * seed * x / 4 + 3.2;
        let out = (X1 ^ X2) * (X1 + X2) + (X1 & X2) * (X1 * X2) + (X1 | X2) * Math.min(X1, X2);
        return Math.floor(out) % max;
    }
}

tileAnim.animate[TILE_ANIM.BLUE] = function (dt, ind) {
    return tileAnim.shrink(dt, ind, COLOR.BLUE);
};
tileAnim.animate[TILE_ANIM.RED] = function (dt, ind) {
    return tileAnim.shrink(dt, ind, COLOR.RED);
};
tileAnim.animate[TILE_ANIM.GREEN] = function (dt, ind) {
    return tileAnim.shrink(dt, ind, COLOR.GREEN);
};
tileAnim.animate[TILE_ANIM.ORANGE] = function (dt, ind) {
    let op = 1 - (tileAnim.time[ind] / 512);
    drawer.lineWidth = 3;
    if (op <= 0) { return true; }
    drawer.setLineWidth(3).setColor(TILE_COLOR.OUTER_TBL[TILE.ORANGE]);
    drawer.drawRect(true, tileAnim.x[ind], tileAnim.y[ind], 16, 16, op);
    return false;
};
tileAnim.animate[TILE_ANIM.DOUBLE_BLUE] = function (dt, ind) {
    return tileAnim.shrinkFill(dt, ind, COLOR.BLUE);
};
tileAnim.animate[TILE_ANIM.DOUBLE_RED] = function (dt, ind) {
    return tileAnim.shrinkFill(dt, ind, COLOR.RED);
};
tileAnim.animate[TILE_ANIM.DOUBLE_ORANGE] = function (dt, ind) {
    let op = 1 - (tileAnim.time[ind] / 512);
    if (op <= 0) { return true; }
    drawer.color = TILE_COLOR.INNER_TBL[TILE.DOUBLE_ORANGE];
    drawer.drawRect(false, tileAnim.x[ind], tileAnim.y[ind], 16, 16, 0.75 * op);
    return false;
};
tileAnim.animate[TILE_ANIM.ORANGE_RED] = function (dt, ind) {
    let op = 1 - (tileAnim.time[ind] / 512);
    if (op <= 0) { return true; }
    drawer.setLineWidth(5 * op + 3).setColor(TILE_COLOR.INNER_TBL[TILE.ORANGE_RED]);
    drawer.drawRect(true, tileAnim.x[ind], tileAnim.y[ind], 16, 16, 0.75);
    drawer.setLineWidth(3).setColor(TILE_COLOR.OUTER_TBL[TILE.ORANGE_RED]);
    drawer.drawRect(true, tileAnim.x[ind], tileAnim.y[ind], 16, 16, op);
    return false;
};
tileAnim.animate[TILE_ANIM.ORANGE_GREEN] = function (dt, ind) {
    let op = 1 - (tileAnim.time[ind] / 512);
    if (op <= 0) { return true; }
    drawer.setLineWidth(5 * op + 3).setColor(TILE_COLOR.INNER_TBL[TILE.ORANGE_GREEN]);
    drawer.drawRect(true, tileAnim.x[ind], tileAnim.y[ind], 16, 16, 0.75);
    drawer.setLineWidth(3).setColor(TILE_COLOR.OUTER_TBL[TILE.ORANGE_GREEN]);
    drawer.drawRect(true, tileAnim.x[ind], tileAnim.y[ind], 16, 16, op);
    return false;
};
tileAnim.animate[TILE_ANIM.YELLOW] = function (dt, ind) {
    return tileAnim.shrink(dt, ind, COLOR.YELLOW);
};
tileAnim.animate[TILE_ANIM.ICE] = function (dt, ind) {
    let op = 1 - (tileAnim.time[ind] / 512) / 2,
        pos = 8 * tileAnim.time[ind] / 512 / 2;
    if (op <= 0) { return true; }
    drawer.setColor(TILE_COLOR.OUTER_TBL[TILE.ICE]);
    let rand1 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 0, 2) - 1,
        rand2 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 1, 2) - 1,
        rand3 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 2, 2) - 1,
        rand4 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 3, 2) - 1,
        rand5 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 4, 2) - 1,
        rand6 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 5, 2) - 1,
        rand7 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 6, 2) - 1,
        rand8 = 2 * tileAnim.RNG(tileAnim.x[ind], tileAnim.y[ind], 7, 2) - 1;
    drawer.drawRect(false, tileAnim.x[ind] + rand1 * pos, tileAnim.y[ind] + rand5 * pos, 3 * op, 13, op);
    drawer.drawRect(false, tileAnim.x[ind] + rand2 * pos + 3 * op, tileAnim.y[ind] + rand6 * pos, 13, 3 * op, op);
    drawer.drawRect(false, tileAnim.x[ind] + rand3 * pos + 16, tileAnim.y[ind] + rand7 * pos + 3, 
        -3 * op, 13, op);
    drawer.drawRect(false, tileAnim.x[ind] + rand4 * pos + 3 * (1 - op), tileAnim.y[ind] + rand8 * pos + 16, 
        13, -3 * op, op);
    return false;
};
