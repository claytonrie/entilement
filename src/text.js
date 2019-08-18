var texts = new (class {
    constructor() {
        this.char = [];
        this.x = [];
        this.y = [];
        this.pos = [];
        this.size = [];
        this.color = [];
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
    constructor (txt, x, y, color, size) {
        let i = txt.length - 1;
        for (; i >= 0; i -= 1) {
            texts.char.push(txt[i]);
            texts.x.push(x + 0.5 * size * i);
            texts.y.push(y);
            texts.pos.push(i);
            texts.size.push(size);
            texts.color.push(color);
            texts.time.push(0);
        }
        texts.length += txt.length;
    }

    static advanceDraw(dt, ind) {
        const phase0 = 64,
            phase1 = 64 + 512,
            phase2 = 64 + 1024,
            phase3 = 64 + 1536,
            phase4 = 4096 - 512,
            phase5 = 4096;
        Drawer.size = texts.size[ind];
        texts.time[ind] += dt;
        let op, inColor, outColor;
        let eTime = texts.time[ind] - 64 * texts.pos[ind],
            phTime;
        let txt = texts.char[ind], x = texts.x[ind],
            y = texts.y[ind], sz = texts.size[ind];
        Drawer.ctx.font = `${sz * Drawer.scale}px monospace`;
        if (eTime < phase5) {
            Drawer.lineWidth = sz / 40;
            if (eTime > phase4) {
                phTime = eTime - phase4;
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y - sz * phTime / 512,
                    1 - phTime / 512);
                Drawer.color = texts.color[ind];
                Drawer.drawText(false, txt, x, y - sz * phTime / 512,
                    1 - phTime / 512);
            } else if (eTime > phase3 || texts.time[ind] < 0) {
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
                phTime = eTime - phase2;
                // Real text
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y, phTime / 512);
                Drawer.color = texts.color[ind];
                Drawer.drawText(false, txt, x, y, phTime / 512);
                // Miscolored text
                Drawer.color = texts.color[ind];
                Drawer.drawText(true, txt, x, y, 1 - phTime / 512);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, 1 - phTime / 512);
            } else if (eTime > phase1) {
                phTime = eTime - phase1;
                // Miscolored text
                Drawer.color = texts.color[ind];
                Drawer.drawText(true, txt, x, y, phTime / 512);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, phTime / 512);
                // Stroke text
                Drawer.color = "#FFF";
                Drawer.drawText(true, txt, x, y, 1 - phTime / 512);
            } else if (eTime > phase0) {
                phTime = eTime - phase0;
                Drawer.color = "#FFF";
                Drawer.drawText(true, txt, x, y + sz * (1 - phTime / 512),
                    phTime / 512);
            }
        } else {
            texts.char.splice(ind, 1);
            texts.x.splice(ind, 1);
            texts.y.splice(ind, 1);
            texts.pos.splice(ind, 1);
            texts.color.splice(ind, 1);
            texts.size.splice(ind, 1);
            texts.time.splice(ind, 1);
            texts.length -= 1;
        }
    }
}
