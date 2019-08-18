var textDisplay = new (class {
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
            textDisplay.char.push(txt[i]);
            textDisplay.x.push(x + 0.5 * size * i);
            textDisplay.y.push(y);
            textDisplay.pos.push(i);
            textDisplay.size.push(size);
            textDisplay.color.push(color);
            textDisplay.time.push(0);
        }
        textDisplay.length += txt.length;
    }

    static advanceDraw(dt, ind) {
        const phase0 = 64,
            phase1 = 64 + 512,
            phase2 = 64 + 1024,
            phase3 = 64 + 1536,
            phase4 = 4096 - 512,
            phase5 = 4096;
        Drawer.size = textDisplay.size[ind];
        textDisplay.time[ind] += dt;
        let op, inColor, outColor;
        let eTime = textDisplay.time[ind] - 64 * textDisplay.pos[ind],
            phTime;
        let txt = textDisplay.char[ind], x = textDisplay.x[ind],
            y = textDisplay.y[ind], sz = textDisplay.size[ind];
        Drawer.ctx.font = `${sz * Drawer.scale}px monospace`;
        if (eTime < phase5) {
            Drawer.lineWidth = sz / 40;
            if (eTime > phase4) {
                phTime = eTime - phase4;
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y - sz * phTime / 512,
                    1 - phTime / 512);
                Drawer.color = textDisplay.color[ind];
                Drawer.drawText(false, txt, x, y - sz * phTime / 512,
                    1 - phTime / 512);
            } else if (eTime > phase3 || textDisplay.time[ind] < 0) {
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y);
                Drawer.color = textDisplay.color[ind];
                Drawer.drawText(false, txt, x, y);
                if (textDisplay.time[ind] < 0 && !textDisplay.stopTime) {
                    textDisplay.time[ind] = phase4;
                } else if (textDisplay.time[ind] > 0 && textDisplay.stopTime) {
                    textDisplay.time[ind] = -Infinity;
                }
            } else if (eTime > phase2) {
                phTime = eTime - phase2;
                // Real text
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y, phTime / 512);
                Drawer.color = textDisplay.color[ind];
                Drawer.drawText(false, txt, x, y, phTime / 512);
                // Miscolored text
                Drawer.color = textDisplay.color[ind];
                Drawer.drawText(true, txt, x, y, 1 - phTime / 512);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, 1 - phTime / 512);
            } else if (eTime > phase1) {
                phTime = eTime - phase1;
                // Miscolored text
                Drawer.color = textDisplay.color[ind];
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
            textDisplay.char.splice(ind, 1);
            textDisplay.x.splice(ind, 1);
            textDisplay.y.splice(ind, 1);
            textDisplay.pos.splice(ind, 1);
            textDisplay.color.splice(ind, 1);
            textDisplay.size.splice(ind, 1);
            textDisplay.time.splice(ind, 1);
            textDisplay.length -= 1;
        }
    }
}
