var texts = new (class {
    constructor() {
        this.char = [];
        this.x = []; this.y = [];
        this.off = [];
        this.size = [];
        this.color = [];
        this.pos = [];
        this.time = [];
        this.length = 0;
        this.stopTime = false;
    }

    drawAll (dt) {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            TextAnimation.advanceDraw(dt, i);
        }
    }
})();

class TextAnimation {
    constructor (txt, x, y, color, size, off = i => 0) {
        let i = txt.length - 1;
        for (; i >= 0; i -= 1) {
            if (txt[i] === " ") {
                continue;
            }
            texts.char.push(txt[i]);
            texts.x.push(x + 0.5 * size * i);
            texts.y.push(y);
            texts.pos.push(i);
            texts.size.push(size);
            texts.color.push(color);
            texts.off.push(off(i, size, x + 0.5 * size * i, y, txt.length));
            texts.time.push(0);
            texts.length += 1;
        }
    }

    static advanceDraw(dt, ind) {
        const len0 = 64,
            len1 = 512,
            len2 = 512,
            len3 = 512,
            len4 = 2048,
            len5 = len1;
        const phase0 = len0,
            phase1 = phase0 + len1,
            phase2 = phase1 + len2,
            phase3 = phase2 + len3,
            phase4 = phase3 + len4,
            phase5 = phase4 + len5;
        Drawer.size = texts.size[ind];
        texts.time[ind] += dt;
        let op, inColor, outColor;
        let eTime = texts.time[ind] - 64 * texts.pos[ind],
            phTime;
        let txt = texts.char[ind], x = texts.x[ind],
            y = texts.y[ind], sz = texts.size[ind],
            off = texts.off[ind];
        Drawer.ctx.font = `${sz * Drawer.scale}px monospace`;
        if (eTime < phase5) {
            Drawer.lineWidth = sz / 40;
            if (eTime > phase4) {
                // Phase 5
                phTime = (eTime - phase4) / len5;
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y - sz * phTime,
                    1 - phTime);
                Drawer.color = texts.color[ind];
                Drawer.drawText(false, txt, x, y - sz * phTime,
                    1 - phTime);
            } else if (eTime > phase3 || texts.time[ind] < 0) {
                // Phase 4
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y);
                Drawer.color = texts.color[ind];
                Drawer.drawText(false, txt, x, y);
                if (texts.time[ind] < 0 && !texts.stopTime) {
                    texts.time[ind] = phase4;
                } else if (texts.time[ind] > 0 && texts.stopTime) {
                    texts.time[ind] = -Infinity;
                }
            } else if (eTime > phase2) {
                // Phase 3
                phTime = (eTime - phase2) / len3;
                // Real text
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y, phTime);
                Drawer.color = texts.color[ind];
                Drawer.drawText(false, txt, x, y, phTime);
                // Miscolored text
                Drawer.color = texts.color[ind];
                Drawer.drawText(true, txt, x, y, 1 - phTime);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, 1 - phTime);
            } else if (eTime > phase1) {
                // Phase 2
                phTime = (eTime - phase1) / len2;
                // Miscolored text
                Drawer.color = texts.color[ind];
                Drawer.drawText(true, txt, x, y, phTime);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, phTime);
                // Stroke text
                Drawer.color = "#FFF";
                Drawer.drawText(true, txt, x + off * (1 - phTime), y, 1 - phTime);
            } else if (eTime > phase0) {
                // Phase 1
                phTime = (eTime - phase0) / len1;
                Drawer.color = "#FFF";
                Drawer.drawText(true, txt, x + off, y + sz * (1 - phTime), phTime);
            }
        } else {
            texts.char.splice(ind, 1);
            texts.x.splice(ind, 1);
            texts.y.splice(ind, 1);
            texts.pos.splice(ind, 1);
            texts.color.splice(ind, 1);
            texts.size.splice(ind, 1);
            texts.time.splice(ind, 1);
            texts.off.splice(ind, 1);
            texts.length -= 1;
        }
    }
}
