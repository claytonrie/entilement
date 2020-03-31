var tiles = new (class {
    constructor (tMax, taMax) {
        // Tile objects
        this.type = new Uint8Array(tMax);
        this.x = new Int8Array(tMax);
        this.y = new Int8Array(tMax);
        this.length = 0;
        // Tile Animations
        this.atype = new Uint8Array(taMax);
        this.ax = new Int16Array(taMax);
        this.ay = new Int16Array(taMax);
        this.atime = new Uint16Array(taMax);
        //this.amisc = [];
        this.alength = 0;
    }

    getTile (x, y) {
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.x[i] === bx && this.y[i] === by) {
                return this.type[i];
            }
        }
        return -1;
    }

    setTile (type, x, y) {
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.x[i] === bx && this.y[i] === by) {
                if (type === TILE.NULL) {
                    this.length -= 1;
                    if (i < this.length) {
                        this.type[i] = this.type[this.length];
                        this.x[i] = this.x[this.length];
                        this.y[i] = this.y[this.length];
                    }
                } else {
                    this.type[i] = type;
                }
                return false;
            }
        }
        new Tile(type, bx, by, false);
        return true;
    }

    searchHorz(x, y, backwards = false) {
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        let i = this.length - 1;
        let bound = backwards ? 0 : tiles.maxX, sign = backwards ? -1 : 1;
        for (; i >= 0; i -= 1) {
            if (this.y[i] === by) {
                if (sign * this.x[i] < sign * bound &&
                        sign * this.x[i] >= sign * bx) {
                    bound = this.x[i];
                    if (bound === bx) {
                        return bx;
                    }
                }
            }
        }
        return bound;
    }
    searchVert(x, y, backwards = false) {
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        let i = this.length - 1;
        let bound = backwards ? 0 : tiles.maxY, sign = backwards ? -1 : 1;
        for (; i >= 0; i -= 1) {
            if (this.x[i] === bx) {
                if (sign * this.y[i] < sign * bound &&
                        sign * this.y[i] >= sign * by) {
                    bound = this.y[i];
                    if (bound === by) {
                        return by;
                    }
                }
            }
        }
        return bound;
    }

    checkEnding () {
        let i = this.length - 1;
        const exceptions = [TILE.PURPLE, TILE.STEEL, TILE.WALL];
        for (; i >= 0; i -= 1) {
            if (!exceptions.includes(this.type[i])) {
                return false;
            }
        }
        return true;
    }

    drawAll(dt) {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            Tile.draw(this.type[i], this.x[i] * 16, this.y[i] * 16);
        }
        i = this.alength - 1;
        if (i >= 0) {
            for (; i >= 0; i -= 1) {
                TileAnimation.advanceDraw(dt, i);
            }
        }
    }
})(256, 256);
tiles.maxX = 60;
tiles.maxY = 60;

class Tile {
    constructor (type, x, y, divide = true) {
        tiles.type[tiles.length] = type;
        // Position divided by 16
        if (divide) {
            if ((x / 16) | 0 > tiles.maxX || (y / 16) | 0 > tiles.maxY) {
                throw new Error(`Tile out of bounds at position (${(x / 16) | 0}, ${(y / 16) | 0})`);
            }
            tiles.x[tiles.length] = (x / 16) | 0;
            tiles.y[tiles.length] = (y / 16) | 0;
        } else {
            if ((x | 0) > tiles.maxX || (y | 0) > tiles.maxY) {
                throw new Error(`Tile out of bounds at position (${x | 0}, ${y | 0})`);
            }
            tiles.x[tiles.length] = x | 0;
            tiles.y[tiles.length] = y | 0;
        }
        tiles.length += 1;
        return true;
    }

    static draw(type, x, y) {
        let dx = x - (x % 16),
            dy = y - (y % 16);
        if (Tile.innerColorTable[type] !== null) {
            Drawer.color = Tile.innerColorTable[type];
            Drawer.drawRect(false, dx, dy, 16, 16, 0.75);
        }
        Drawer.setLineWidth(3).setColor(Tile.outerColorTable[type]);
        Drawer.drawRect(true, dx, dy, 16, 16);
    }

    static onStep(type, dir) {
        let posx = player.tar.x,
            posy = player.tar.y;
        posx -= posx % 16; posy -= posy % 16;
        player.lastStep = type;
        // Nothing for type < 0 (no Tile)
        if (type === TILE.BLUE) { // Blue tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(0, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.RED) { // Red tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(1, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.GREEN) { // Green tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(2, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        // Nothing for Purple tiles (ends the level)
        if (type === TILE.ORANGE) { // Orange Tile
            tiles.setTile(0, posx, posy); // Change to Blue tile
            new TileAnimation(4, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.STEEL) { // Steel tile (never breaks)
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.DOUBLE_BLUE) { // Double Blue (goes diagonal)
            tiles.setTile(-1, posx, posy);
            new TileAnimation(6, posx, posy);
            player.tar.addEq(Vec2.scAddSc(16, dir, 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === TILE.DOUBLE_RED) { // Double Red
            tiles.setTile(-1, posx, posy);
            new TileAnimation(7, posx, posy);
            player.tar.addEq(Vec2.scAddSc(2 * 16, dir, 2 * 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === TILE.DOUBLE_ORANGE) { // Double Orange (takes 3 steps)
            tiles.setTile(4, posx, posy); // Change to an orange tile
            new TileAnimation(8, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.ORANGE_RED) { // Orange Red
            tiles.setTile(1, posx, posy); // Change to a red tile
            new TileAnimation(9, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.ORANGE_GREEN) { // Orange Green
            tiles.setTile(2, posx, posy); // Change to a green tile
            new TileAnimation(10, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.YELLOW) { // Yellow tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(11, posx, posy);
            if (dir.x !== 0) {
                player.tar.x = 16 * tiles.searchHorz(posx + dir.x * 16, posy, dir.x < 0) + 8;
            } else {
                player.tar.y = 16 * tiles.searchVert(posx, posy + dir.y * 16, dir.y < 0) + 8;
            }
            player.resetTransition();
            return;
        }
        throw new Error("Invalid Tile Type");
    }

    // Return how many spaces we can move
    static onLand(type, dir) {
        let posx = player.tar.x,
            posy = player.tar.y;
        const LAND_TBL = [1, 2, 3, 0, 1, 1, -1, -2, 1, 2, 3, Infinity, 0, 0, 0];
        if (type <= TILE.NULL) {
            player.die();
            return 0;
        }
        if (type === TILE.PURPLE) { // Purple tile (ends level)
            if (tiles.checkEnding()) {
                level.next();
            } else {
                player.die();
            }
            return 0;
        }
        if (type === TILE.ICE_BLUE) {
            Tile.onStep(TILE.BLUE, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return 1;
        }
        if (type === TILE.ICE) {
            Tile.onStep(player.lastStep, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(posx, posy), dir);
        }
        if (type === TILE.ICE_RED) {
            Tile.onStep(TILE.RED, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(posx, posy), dir);
        }
        if (type === TILE.ICE_GREEN) {
            Tile.onStep(TILE.GREEN, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(posx, posy), dir);
        }
        return LAND_TBL[type];
    }
}
Tile.outerColorTable = [];
Tile.outerColorTable[TILE.BLUE]          = COLOR.BLUE;
Tile.outerColorTable[TILE.RED]           = COLOR.RED;
Tile.outerColorTable[TILE.GREEN]         = COLOR.GREEN;
Tile.outerColorTable[TILE.PURPLE]        = COLOR.PURPLE;
Tile.outerColorTable[TILE.ORANGE]        = COLOR.ORANGE;
Tile.outerColorTable[TILE.STEEL]         = COLOR.STEEL;
Tile.outerColorTable[TILE.DOUBLE_BLUE]   = COLOR.BLUE;
Tile.outerColorTable[TILE.DOUBLE_RED]    = COLOR.RED;
Tile.outerColorTable[TILE.DOUBLE_ORANGE] = COLOR.ORANGE;
Tile.outerColorTable[TILE.ORANGE_RED]    = COLOR.ORANGE;
Tile.outerColorTable[TILE.ORANGE_GREEN]  = COLOR.ORANGE;
Tile.outerColorTable[TILE.YELLOW]        = COLOR.YELLOW;
Tile.outerColorTable[TILE.ICE_BLUE]      = COLOR.ICE;
Tile.outerColorTable[TILE.ICE]           = COLOR.ICE;
Tile.outerColorTable[TILE.ICE_RED]       = COLOR.ICE;
Tile.outerColorTable[TILE.ICE_GREEN]     = COLOR.ICE;
Tile.outerColorTable[TILE.WALL]          = COLOR.STEEL;

Tile.innerColorTable = [];
Tile.innerColorTable[TILE.BLUE]          = null;
Tile.innerColorTable[TILE.RED]           = null;
Tile.innerColorTable[TILE.GREEN]         = null;
Tile.innerColorTable[TILE.PURPLE]        = null;
Tile.innerColorTable[TILE.ORANGE]        = null;
Tile.innerColorTable[TILE.STEEL]         = null;
Tile.innerColorTable[TILE.DOUBLE_BLUE]   = COLOR.BLUE;
Tile.innerColorTable[TILE.DOUBLE_RED]    = COLOR.RED;
Tile.innerColorTable[TILE.DOUBLE_ORANGE] = COLOR.ORANGE;
Tile.innerColorTable[TILE.ORANGE_RED]    = COLOR.RED;
Tile.innerColorTable[TILE.ORANGE_GREEN]  = COLOR.GREEN;
Tile.innerColorTable[TILE.YELLOW]        = null;
Tile.innerColorTable[TILE.ICE_BLUE]      = COLOR.BLUE;
Tile.innerColorTable[TILE.ICE]           = null;
Tile.innerColorTable[TILE.ICE_RED]       = COLOR.RED;
Tile.innerColorTable[TILE.ICE_GREEN]     = COLOR.GREEN;
Tile.innerColorTable[TILE.WALL]          = COLOR.STEEL;
