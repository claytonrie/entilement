var tiles = new (class {
    constructor () {
        // Tile objects
        this.type = [];
        this.x = []; this.y = [];
        this.length = 0;
        // Tile Animations
        this.atype = [];
        this.ax = []; this.ay = [];
        this.atime = []; this.amisc = [];
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
                if (type === -1) {
                    this.type.splice(i, 1);
                    this.x.splice(i, 1); this.y.splice(i, 1);
                    this.length -= 1;
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
        const exceptions = [3, 5];
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
})();
tiles.maxX = 60;
tiles.maxY = 60;

class Tile {
    constructor (type, x, y, divide = true) {
        tiles.type.push(type);
        // Position divided by 16
        if (divide) {
            if ((x / 16) | 0 > tiles.maxX || (y / 16) | 0 > tiles.maxY) {
                throw new Error(`Tile out of bounds at position (${(x / 16) | 0}, ${(y / 16) | 0})`);
            }
            tiles.x.push((x / 16) | 0);
            tiles.y.push((y / 16) | 0);
        } else {
            if ((x | 0) > tiles.maxX || (y | 0) > tiles.maxY) {
                throw new Error(`Tile out of bounds at position (${x | 0}, ${y | 0})`);
            }
            tiles.x.push(x | 0);
            tiles.y.push(y | 0);
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
        console.log(type, dir);
        // Nothing for type < 0 (no Tile)
        if (type === 0) { // Blue tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(0, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === 1) { // Red tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(1, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === 2) { // Green tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(2, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        // Nothing for type 3 (Purple tile)
        if (type === 4) { // Orange Tile
            tiles.setTile(0, posx, posy); // Change to Blue tile
            new TileAnimation(4, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === 5) { // Steel tile (never breaks)
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === 6) { // Double Blue (goes diagonal)
            tiles.setTile(-1, posx, posy);
            new TileAnimation(6, posx, posy);
            player.tar.addEq(Vec2.scAddSc(16, dir, 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === 7) { // Double Red
            tiles.setTile(-1, posx, posy);
            new TileAnimation(7, posx, posy);
            player.tar.addEq(Vec2.scAddSc(2 * 16, dir, 2 * 16, dir.perp()));
            player.resetTransition();
            return;
        }
        if (type === 8) { // Double Orange (takes 3 steps)
            tiles.setTile(4, posx, posy); // Change to an orange tile
            new TileAnimation(8, posx, posy);
            player.tar.addEq(dir.scale(16));
            player.resetTransition();
            return;
        }
        if (type === 9) { // Orange Red
            tiles.setTile(1, posx, posy); // Change to a red tile
            new TileAnimation(9, posx, posy);
            player.tar.addEq(dir.scale(2 * 16));
            player.resetTransition();
            return;
        }
        if (type === 10) { // Orange Green
            tiles.setTile(2, posx, posy); // Change to a green tile
            new TileAnimation(10, posx, posy);
            player.tar.addEq(dir.scale(3 * 16));
            player.resetTransition();
            return;
        }
        if (type === 11) { // Yellow tile
            tiles.setTile(-1, posx, posy);
            new TileAnimation(11, posx, posy);
            if (dir.x !== 0) {
                player.tar.x = 16 * tiles.searchHorz(posx + dir.x * 16, posy, dir.x < 0);
            } else {
                player.tar.y = 16 * tiles.searchVert(posx, posy + dir.y * 16, dir.y < 0);
            }
            player.resetTransition();
            return;
        }
        throw new Error("Invalid Tile Type");
    }
    
    static onLand(type, dir) {
        if (type < 0) {
            player.die();
        }
        if (type === 3) { // Purple tile (ends level)
            if (tiles.checkEnding()) {
                level.next();
            } else {
                player.die();
            }
            return;
        }
    }
}
Tile.outerColorTable = [
    "blue", "red", "green",
    "purple",
    "orange", "grey",
    "blue", "red",
    "#F80", "#F80", "#F80",
    "yellow"
];
Tile.innerColorTable = [
    null, null, null,
    null,
    null, null,
    "blue", "red",
    "#F80", "red", "green",
    null
];
