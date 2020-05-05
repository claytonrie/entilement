var tile = {
    maxX: TILE_MAX_X, maxY: TILE_MAX_Y,
    max: TILE_MAX,
    count: 0,
    // Tile objects
    // Format:
    //   INDEX = (x + maxX * y)
    //   VALUE = tile type
    type: new Int8Array(TILE_MAX),

    getTile (x, y, doDivide = true) {
        // Calculate the tile x and y grid positions
        let bx, by;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (bx < 0 || by < 0 || bx >= this.maxX || by >= this.maxY) {
            return TILE.NULL;
        }
        return this.type[bx + this.maxX * by];
    },
    
    getIndex (x, y, doDivide = true) {
        // Calculate the tile x and y grid positions
        let bx, by;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (bx < 0 || by < 0 || bx >= this.maxX || by >= this.maxY) {
            return -1;
        }
        return bx + this.maxX * by;
    },

    setTile (type, x, y, doUndo = true, doDivide = true, doScout = false) {
        // Calculate the tile x and y grid positions
        let bx, by, ind;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (bx < 0 || by < 0 || bx >= this.maxX || by >= this.maxY) {
            return false;
        }
        ind = bx + this.maxX * by;
        let prevType = this.type[ind];
        // Change the type
        this.type[ind] = type;
        // Handle storing this tile update
        if (doUndo) {
            if (doScout) {
                undo.addScoutUpdate(prevType, bx, by);
            } else {
                undo.addTileUpdate(prevType, ind);
            }
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
    },

    searchHorz(x, y, backwards = false, doDivide = true) {
        // Calculate the tile x and y grid positions
        let bx, by;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (backwards) {
            for (; bx >= 0; bx -= 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        } else {
            for (; bx < this.maxX; bx += 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        }
        return bx;
    },
    searchVert(x, y, backwards = false, doDivide = true) {
        // Calculate the tile x and y grid positions
        let bx, by;
        if (doDivide) {
            bx = (x / 16) | 0;
            by = (y / 16) | 0;
        } else {
            bx = x | 0; by = y | 0;
        }
        if (backwards) {
            for (; by >= 0; by -= 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        } else {
            for (; by < this.maxY; by += 1) {
                if (this.type[bx + this.maxX * by] > TILE.NULL) { break; }
            }
        }
        return by;
    },
    
    checkEnding () { return this.count === 0; },

    draw(type, x, y) {
        let dx = x - (x % 16),
            dy = y - (y % 16);
        if (TILE_COLOR.INNER_TBL[type] !== null) {
            drawer.color = TILE_COLOR.INNER_TBL[type];
            drawer.drawRect(false, dx, dy, 16, 16, 0.75);
        }
        drawer.setLineWidth(3).setColor(TILE_COLOR.OUTER_TBL[type]);
        drawer.drawRect(true, dx, dy, 16, 16);
    },
    drawAll(dt) {
        let i = this.max - 1;
        for (; i >= 0; i -= 1) {
            if (this.type[i] > TILE.NULL) {
                this.draw(this.type[i], 16 * (i % this.maxX), 16 * ((i / this.maxX) | 0));
            }
        }
    },

    onStep(type, dir) {
        let posx = player.to.tar.x,
            posy = player.to.tar.y;
        posx -= posx % 16; posy -= posy % 16;
        player.lastStep = type;
        
        let scale = Math.abs(TILE_PROP.TRAVEL_TBL[type]);
        if (type <= TILE.NULL || type === TILE.WALL || type > TILE.WALL) {
            return false;
        }
        this.setTile(TILE_PROP.CHANGE_TBL[type], posx, posy);
        // Nothing for type < 0 (no Tile)
        if (type === TILE.BLUE) {
            tileAnim.create(TILE_ANIM.BLUE, posx, posy);
        } else if (type === TILE.RED) {
            tileAnim.create(TILE_ANIM.RED, posx, posy);
        } else if (type === TILE.GREEN) {
            tileAnim.create(TILE_ANIM.GREEN, posx, posy);
        }
        // Nothing for Purple tile (ends the level)
        else if (type === TILE.ORANGE) { // Takes 2 steps
            tileAnim.create(TILE_ANIM.ORANGE, posx, posy);
        } else if (type === TILE.STEEL) { // Never breaks
            //undo.addTileUpdate(TILE.STEEL, this.getIndex(posx, posy));
        } else if (type === TILE.DOUBLE_BLUE) { // Goes diagonal
            tileAnim.create(TILE_ANIM.DOUBLE_BLUE, posx, posy);
        } else if (type === TILE.DOUBLE_RED) { // Goes diagonal
            tileAnim.create(TILE_ANIM.DOUBLE_RED, posx, posy);
        } else if (type === TILE.DOUBLE_ORANGE) { // Takes 3 steps
            tileAnim.create(TILE_ANIM.DOUBLE_ORANGE, posx, posy);
        } else if (type === TILE.ORANGE_RED) {
            tileAnim.create(TILE_ANIM.ORANGE_RED, posx, posy);
        } else if (type === TILE.ORANGE_GREEN) {
            tileAnim.create(TILE_ANIM.ORANGE_GREEN, posx, posy);
        } else if (type === TILE.YELLOW) {
            tileAnim.create(TILE_ANIM.YELLOW, posx, posy);
            if (dir.x !== 0) {
                player.to.tar.x = 16 * this.searchHorz(posx + dir.x * 16, posy, dir.x < 0) + 8;
            } else {
                player.to.tar.y = 16 * this.searchVert(posx, posy + dir.y * 16, dir.y < 0) + 8;
            }
            player.to.resetTransition();
            return;
        }
        player.to.tar.addEq(dir.scale(16 * scale));
        player.to.resetTransition();
    },
    
    onStepScout(type, dir) {
        let posx = player.scout.x,
            posy = player.scout.y;
        posx -= posx % 16; posy -= posy % 16;
        player.lastStep = type;
        
        let direction = new Vec2(dir.x, dir.y), scale = Math.abs(TILE_PROP.TRAVEL_TBL[type]);
        if (type <= TILE.NULL || type === TILE.WALL || type > TILE.WALL) {
            return false;
        }
        this.setTile(TILE_PROP.CHANGE_TBL[type], posx, posy, true, true, true);
        if (type === TILE.YELLOW) {
            this.setTile(TILE.NULL, posx, posy, true, true, true);
            // "onOver" is unneeded here
            if (dir.x !== 0) {
                player.scout.x = 16 * this.searchHorz(posx + dir.x * 16, posy, dir.x < 0) + 8;
            } else {
                player.scout.y = 16 * this.searchVert(posx, posy + dir.y * 16, dir.y < 0) + 8;
            }
            return true;
        }
        let ret = this.onOver(direction, scale);
        player.scout.addEq(direction.scale(16 * scale));
        return ret;
    },

    // Return how many spaces we can move
    onLand(type, dir) {
        let posx = player.to.tar.x,
            posy = player.to.tar.y;
        posx -= posx % 16; posy -= posy % 16;
        if (type <= TILE.NULL) {
            player.die();
            return 0;
        } else if (type === TILE.PURPLE) { // Ends level
            if (this.checkEnding()) {
                level.next();
            } else {
                player.die();
            }
            return 0;
        } else if (type === TILE.ICE_BLUE) {
            this.onStep(TILE.BLUE, dir);
            tileAnim.create(TILE_ANIM.ICE, posx, posy);
            return this.onLand(this.getTile(player.to.tar.x, player.to.tar.y), dir);
        } else if (type === TILE.ICE) {
            this.onStep(player.lastStep, dir);
            tileAnim.create(TILE_ANIM.ICE, posx, posy);
            return this.onLand(this.getTile(player.to.tar.x, player.to.tar.y), dir);
        } else if (type === TILE.ICE_RED) {
            this.onStep(TILE.RED, dir);
            tileAnim.create(TILE_ANIM.ICE, posx, posy);
            return this.onLand(this.getTile(player.to.tar.x, player.to.tar.y), dir);
        } else if (type === TILE.ICE_GREEN) {
            this.onStep(TILE.GREEN, dir);
            tileAnim.create(TILE_ANIM.ICE, posx, posy);
            return this.onLand(this.getTile(player.to.tar.x, player.to.tar.y), dir);
        }
        return TILE_TRAVEL_TBL[type];
    },
    
    // Return whether we landed on a valid space
    onLandScout(type, dir) {
        let posx = player.scout.x,
            posy = player.scout.y;
        posx -= posx % 16; posy -= posy % 16;
        if (type <= TILE.NULL || type === TILE.WALL) {
            return SCOUT_CODE.INVALID;
        } else if (type === TILE.PURPLE) {
            return this.checkEnding() ? SCOUT_CODE.END : SCOUT_CODE.INVALID;
        } else if (type === TILE.ICE_BLUE) {
            let isValid = this.onStepScout(TILE.BLUE, dir);
            if (!isValid) return SCOUT_CODE.INVALID;
            return this.onLandScout(this.getTile(player.scout.x, player.scout.y), dir);
        } else if (type === TILE.ICE) {
            let isValid = this.onStepScout(player.lastStep, dir);
            if (!isValid) return SCOUT_CODE.INVALID;
            return this.onLandScout(this.getTile(player.scout.x, player.scout.y), dir);
        } else if (type === TILE.ICE_RED) {
            let isValid = this.onStepScout(TILE.RED, dir);
            if (!isValid) return SCOUT_CODE.INVALID;
            return this.onLandScout(this.getTile(player.scout.x, player.scout.y), dir);
        } else if (type === TILE.ICE_GREEN) {
            let isValid = this.onStepScout(TILE.GREEN, dir);
            if (!isValid) return SCOUT_CODE.INVALID;
            return this.onLandScout(this.getTile(player.scout.x, player.scout.y), dir);
        }
        return SCOUT_CODE.VALID;
    },
    
    // Return true if we can pass over this direction
    onOver(dir, scale) {
        if (scale < 2) {
            return true;
        }
        let i = 1;
        for (; i < scale; i += 1) {
            let type = this.getTile(player.scout.x + 16 * i * dir.x,
                    player.scout.y + 16 * i * dir.y);
            if (type == TILE.WALL) { return false; }
        }
        return true;
    }
};

// Initialize the board
let i = TILE_MAX - 1;
for (; i >= 0; i -= 1) {
    tile.type[i] = TILE.NULL;
}
