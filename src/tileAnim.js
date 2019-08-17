// Animation types:
//     0, 1, 2, 4, 6, 7, 8, 9, 10, 11
class TileAnimation {
    constructor (type, x, y) {
        tiles.atype.push(type);
        tiles.ax.push(x); tiles.ay.push(y);
        tiles.atime.push(0);
        tiles.amisc.push(null);
        TileAnimation[`init${tiles.atype[tiles.alength]}`](tiles.alength);
        tiles.alength += 1;
        return true;
    }
    static  init0(ind) {}
    static  init1(ind) {}
    static  init2(ind) {}
    static  init4(ind) {}
    static  init6(ind) {}
    static  init7(ind) {}
    static  init8(ind) {}
    static  init9(ind) {}
    static init10(ind) {}
    static init11(ind) {}

    static advanceDraw(dt, ind) {
        tiles.atime[ind] += dt;
        if (TileAnimation[`animate${tiles.atype[ind]}`](dt, ind)) {
            // Delete tile animation if done
            tiles.atype.splice(ind, 1);
            tiles.ax.splice(ind, 1);
            tiles.ay.splice(ind, 1);
            tiles.atime.splice(ind, 1);
            tiles.amisc.splice(ind, 1);
            tiles.alength -= 1;
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

    static animate0 (dt, ind) { return TileAnimation.shrink(dt, ind, "blue"); }
    static animate1 (dt, ind) { return TileAnimation.shrink(dt, ind, "red"); }
    static animate2 (dt, ind) { return TileAnimation.shrink(dt, ind, "green"); }
    static animate4 (dt, ind) {
        let op = 1 - (tiles.atime[ind] / 512);
        Drawer.lineWidth = 3;
        if (op <= 0) { return true; }
        Drawer.setLineWidth(3).setColor(Tile.outerColorTable[4]);
        Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
        return false;
    }
    static animate6 (dt, ind) { return TileAnimation.shrinkFill(dt, ind, "blue"); }
    static animate7 (dt, ind) { return TileAnimation.shrinkFill(dt, ind, "red"); }
    static animate8 (dt, ind) {
        let op = 1 - (tiles.atime[ind] / 512);
        if (op <= 0) { return true; }
        Drawer.color = Tile.innerColorTable[8];
        Drawer.drawRect(false, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75 * op);
        return false;
    }
    static animate9 (dt, ind) {
        let op = 1 - (tiles.atime[ind] / 512);
        if (op <= 0) { return true; }
        Drawer.setLineWidth(5 * op + 3).setColor(Tile.innerColorTable[9]);
        Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75);
        Drawer.setLineWidth(3).setColor(Tile.outerColorTable[9]);
        Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
        return false;
    }
    static animate10 (dt, ind) {
        let op = 1 - (tiles.atime[ind] / 512);
        if (op <= 0) { return true; }
        Drawer.setLineWidth(5 * op + 3).setColor(Tile.innerColorTable[10]);
        Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, 0.75);
        Drawer.setLineWidth(3).setColor(Tile.outerColorTable[10]);
        Drawer.drawRect(true, tiles.ax[ind], tiles.ay[ind], 16, 16, op);
        return false;
    }
    static animate11 (dt, ind) { return TileAnimation.shrink(dt, ind, "#FF0"); }
}
