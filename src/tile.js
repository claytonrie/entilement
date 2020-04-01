var tiles = new (class {
    constructor (maxX, maxY) {
        this.maxX = maxX;
        this.maxY = maxY;
        this.max  = maxX * maxY;
        this.count = 0;
        // Tile objects
        // Format:
        //   INDEX = (x + maxX * y)
        //   VALUE = tile type
        this.type = new Int8Array(this.max); 
        let i = this.max - 1;
        for (; i >= 0; i -= 1) {
            this.type[i] = TILE.NULL;
        }
        
        // Tile Animations
        this.atype = new Uint8Array(this.max);
        this.ax = new Int16Array(this.max);
        this.ay = new Int16Array(this.max);
        this.atime = new Uint16Array(this.max);
        this.alength = 0;
    }

    getTile (x, y) {
        // Calculate the tile x and y grid positions
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        return this.type[bx + this.maxX * by];
    }

    setTile (type, x, y, doUndo = true, doDivide = true) {
        // Calculate the tile x and y grid positions
        let bx, by, ind;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        ind = bx + this.maxX * by;
        let prevType = this.type[ind];
        // Change the type
        this.type[ind] = type;
        // Handle storing this tile update
        if (doUndo) {
            UndoHandler.addTileUpdate(prevType, ind);
        }
        // Handle updating the total number of tiles
        const staticTiles = [TILE.PURPLE, TILE.STEEL, TILE.WALL];
        if ((prevType <= TILE.NULL) && (type > TILE.NULL)) {
            // If the tile can't disappear, don't add it to the count
            if (!staticTiles.includes(type)) {
                this.count += 1;
            }
            return true;
        } else if ((prevType > TILE.NULL) && (type <= TILE.NULL)) {
            this.count -= 1;
        }
        return false;
    }

    searchHorz(x, y, backwards = false) {
        // Calculate the tile x and y grid positions
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        if (backwards) {
            for (; bx >= 0; bx -= 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        } else {
            for (; bx < tiles.maxX; bx += 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        }
        return bx;
    }
    searchVert(x, y, backwards = false) {
        // Calculate the tile x and y grid positions
        let bx = (x / 16) | 0, by = (y / 16) | 0;
        if (backwards) {
            for (; by >= 0; by -= 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        } else {
            for (; by < tiles.maxY; by += 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        }
        return by;
    }
    
    checkEnding () {
        return this.count === 0;
    }

    drawAll(dt) {
        let i = this.max - 1;
        for (; i >= 0; i -= 1) {
            if (this.type[i] > TILE.NULL) {
                Tile.draw(this.type[i], 16 * (i % this.maxX), 16 * ((i / this.maxX) | 0));
            }
        }
        i = this.alength - 1;
        if (i >= 0) {
            for (; i >= 0; i -= 1) {
                TileAnimation.advanceDraw(dt, i);
            }
        }
    }
})(16, 16);

class Tile {
    constructor (type, x, y, divide = true) {
        let bx, by;
        // Position divided by 16
        if (divide) {
            bx = (x / 16) | 0; by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (bx > tiles.maxX || by > tiles.maxY) {
            throw new Error(`Tile out of bounds at position (${bx}, ${by})`);
        }
        tiles.type[bx + tiles.maxX * by] = type;
        tiles.count += 1;
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
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.BLUE, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.RED) { // Red tile
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.RED, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.GREEN) { // Green tile
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.GREEN, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        // Nothing for Purple tiles (ends the level)
        if (type === TILE.ORANGE) { // Orange Tile
            tiles.setTile(TILE.BLUE, posx, posy); // Change to Blue tile
            new TileAnimation(TILE_ANIM.ORANGE, posx, posy);
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
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.DOUBLE_BLUE, posx, posy);
            player.tar.addEq(Vec2.scAddSc(16, dir, 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === TILE.DOUBLE_RED) { // Double Red
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.DOUBLE_RED, posx, posy);
            player.tar.addEq(Vec2.scAddSc(2 * 16, dir, 2 * 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === TILE.DOUBLE_ORANGE) { // Double Orange (takes 3 steps)
            tiles.setTile(TILE.ORANGE, posx, posy); // Change to an orange tile
            new TileAnimation(TILE_ANIM.DOUBLE_ORANGE, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === TILE.ORANGE_RED) { // Orange Red
            tiles.setTile(TILE.RED, posx, posy); // Change to a red tile
            new TileAnimation(TILE_ANIM.ORANGE_RED, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.ORANGE_GREEN) { // Orange Green
            tiles.setTile(TILE.GREEN, posx, posy); // Change to a green tile
            new TileAnimation(TILE_ANIM.ORANGE_GREEN, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        if (type === TILE.YELLOW) { // Yellow tile
            tiles.setTile(TILE.NULL, posx, posy);
            new TileAnimation(TILE_ANIM.YELLOW, posx, posy);
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
        posx -= posx % 16; posy -= posy % 16;
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
            return Tile.onLand(tiles.getTile(player.tar.x, player.tar.y), dir);
        }
        if (type === TILE.ICE) {
            Tile.onStep(player.lastStep, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(player.tar.x, player.tar.y), dir);
        }
        if (type === TILE.ICE_RED) {
            Tile.onStep(TILE.RED, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(player.tar.x, player.tar.y), dir);
        }
        if (type === TILE.ICE_GREEN) {
            Tile.onStep(TILE.GREEN, dir);
            new TileAnimation(TILE_ANIM.ICE, posx, posy);
            return Tile.onLand(tiles.getTile(player.tar.x, player.tar.y), dir);
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
