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
        tiles.atime += dt;
        if (TileAnimation[`animate${tiles.atype[ind]}`](dt, ind)) {
            // Delete tile animation if done
            tiles.atype.splice(ind, 1);
            tiles.ax.splice(ind, 1);
            tiles.ay.splice(ind, 1);
            tiles.atime.splice(ind, 1);
            tiles.amisc.splice(ind, 1);
            return false;
        }
        return true;
    }

    static shrink(dt, ind, color) {
        let shrink = tiles.atime[ind] / 64;
        Drawer.lineWidth = 3 / shrink;
        shrink += 1.5 / shrink;
        if (shrink >= 8) {
            return true;
        }
        Drawer.color = color;
        Drawer.drawRect(true, tiles.ax[ind] + shrink, tiles.ay[ind] + shrink,
            16 - 2 * shrink, 16 - 2 * shrink);
        return false;
    }
    
    static animate0(dt, ind) { return TileAnimation.shrink(dt, ind, "blue"); }
    static animate1(dt, ind) { return TileAnimation.shrink(dt, ind, "red"); }
    static animate2(dt, ind) { return TileAnimation.shrink(dt, ind, "green"); }
}
