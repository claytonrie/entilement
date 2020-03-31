class TileAnimation {
    constructor (type, x, y) {
        tiles.atype[tiles.alength] = type;
        tiles.ax[tiles.alength] = x;
        tiles.ay[tiles.alength] = y;
        tiles.atime[tiles.alength] = 0;
        tiles.alength += 1;
        return true;
    }

    static advanceDraw(dt, ind) {
        tiles.atime[ind] += dt;
        if (TileAnimation.animate[tiles.atype[ind]](dt, ind)) {
            // Delete tile animation if done
            tiles.alength -= 1;
            if (ind < tiles.alength) {
                tiles.atype[ind] = tiles.atype[tiles.alength];
                tiles.ax[ind] = tiles.ax[tiles.alength];
                tiles.ay[ind] = tiles.ay[tiles.alength];
                tiles.atime[ind] = tiles.atime[tiles.alength];
            }
            return false;
        }
        return true;
    }

    static shrink (dt, ind, color)  {
        let shrink = tiles.atime[ind] / 64;
        if (shrink >= 8) { return true; }
        Drawer.setLineWidth(3 / shrink).setColor(color);
        Drawer.drawRect(true, tiles.ax[ind] + shrink, tiles.ay[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink);
        return false;
    }
    static shrinkFill (dt, ind, color)  {
        let shrink = tiles.atime[ind] / 64;
        if (shrink >= 8) { return true; }
        Drawer.setLineWidth(3 / shrink).setColor(color);
        Drawer.drawRect(false, tiles.ax[ind] + shrink, tiles.ay[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink, 0.5);
        Drawer.drawRect(true, tiles.ax[ind] + shrink, tiles.ay[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink);
        return false;
    }
    
    static RNG (x, y, seed, max) {
        // TODO: make an actual peudoRNG generator
        //   This one does a bunch of shit to the numbers to obscure the result, but it probably has some big bias
    	let X1 = x / 16 + 0.1725 * seed * y / 4 + 3.4, X2 = y / 16 + 0.096 * seed * x / 4 + 3.2;
        let out = (X1 ^ X2) * (X1 + X2) + (X1 & X2) * (X1 * X2) + (X1 | X2) * Math.min(X1, X2);
        return Math.floor(out) % max;
    }
}

TileAnimation.animate = [];
TileAnimation.animate[TILE_ANIM.BLUE] = function (dt, ind) {
    return TileAnimation.shrink(dt, ind, COLOR.BLUE);
};
TileAnimation.animate[TILE_ANIM.RED] = function (dt, ind) {
    return TileAnimation.shrink(dt, ind, COLOR.RED);
};
TileAnimation.animate[TILE_ANIM.GREEN] = function (dt, ind) {
    return TileAnimation.shrink(dt, ind, COLOR.GREEN);
};
TileAnimation.animate[TILE_ANIM.ORANGE] = function (dt, ind) {
    let op = 1 - (tiles.atime[ind] / 512);
    Drawer.lineWidth = 3;
    if (op <= 0) { return true; }
    Drawer.setLineWidth(3).setColor(Tile.outerColorTable[4]);
    Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
    return false;
};
TileAnimation.animate[TILE_ANIM.DOUBLE_BLUE] = function (dt, ind) {
    return TileAnimation.shrinkFill(dt, ind, COLOR.BLUE);
};
TileAnimation.animate[TILE_ANIM.DOUBLE_RED] = function (dt, ind) {
    return TileAnimation.shrinkFill(dt, ind, COLOR.RED);
};
TileAnimation.animate[TILE_ANIM.DOUBLE_ORANGE] = function (dt, ind) {
    let op = 1 - (tiles.atime[ind] / 512);
    if (op <= 0) { return true; }
    Drawer.color = Tile.innerColorTable[8];
    Drawer.drawRect(false, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75 * op);
    return false;
};
TileAnimation.animate[TILE_ANIM.ORANGE_RED] = function (dt, ind) {
    let op = 1 - (tiles.atime[ind] / 512);
    if (op <= 0) { return true; }
    Drawer.setLineWidth(5 * op + 3).setColor(Tile.innerColorTable[9]);
    Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75);
    Drawer.setLineWidth(3).setColor(Tile.outerColorTable[9]);
    Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
    return false;
};
TileAnimation.animate[TILE_ANIM.ORANGE_GREEN] = function (dt, ind) {
    let op = 1 - (tiles.atime[ind] / 512);
    if (op <= 0) { return true; }
    Drawer.setLineWidth(5 * op + 3).setColor(Tile.innerColorTable[10]);
    Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75);
    Drawer.setLineWidth(3).setColor(Tile.outerColorTable[10]);
    Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
    return false;
};
TileAnimation.animate[TILE_ANIM.YELLOW] = function (dt, ind) {
    return TileAnimation.shrink(dt, ind, COLOR.YELLOW);
};
TileAnimation.animate[TILE_ANIM.ICE] = function (dt, ind) {
    let op = 1 - (tiles.atime[ind] / 512) / 2,
        pos = 8 * tiles.atime[ind] / 512 / 2;
    if (op <= 0) { return true; }
    Drawer.setColor(Tile.outerColorTable[13]);
    let rand1 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 0, 2) - 1,
        rand2 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 1, 2) - 1,
        rand3 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 2, 2) - 1,
        rand4 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 3, 2) - 1,
        rand5 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 4, 2) - 1,
        rand6 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 5, 2) - 1,
        rand7 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 6, 2) - 1,
        rand8 = 2 * TileAnimation.RNG(tiles.ax[ind], tiles.ay[ind], 7, 2) - 1;
    Drawer.drawRect(false, tiles.ax[ind] + rand1 * pos, tiles.ay[ind] + rand5 * pos, 3 * op, 13, op);
    Drawer.drawRect(false, tiles.ax[ind] + rand2 * pos + 3 * op, tiles.ay[ind] + rand6 * pos, 13, 3 * op, op);
    Drawer.drawRect(false, tiles.ax[ind] + rand3 * pos + 16, tiles.ay[ind] + rand7 * pos + 3, 
        -3 * op, 13, op);
    Drawer.drawRect(false, tiles.ax[ind] + rand4 * pos + 3 * (1 - op), tiles.ay[ind] + rand8 * pos + 16, 
        13, -3 * op, op);
    return false;
};
