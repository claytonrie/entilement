var text = {
    // Variables
    // possibly TODO: change these into typed arrays?
    char: [],
    x: [], y: [],
    off: [],
    size: [],
    color: [],
    pos: [],
    time: [],
    length: 0,
    stopTime: false,

    // Methods
    drawAll (dt) {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            TextAnimation.advanceDraw(dt, i);
        }
    },
    
    create (txt, x, y, color, size, off = (i => 0)) {
        let i = txt.length - 1;
        for (; i >= 0; i -= 1) {
            if (txt[i] === " ") {
                continue;
            }
            this.char.push(txt[i]);
            this.x.push(x + 0.5 * size * i);
            this.y.push(y);
            this.pos.push(i);
            this.size.push(size);
            this.color.push(color);
            this.off.push(off(i, size, x + 0.5 * size * i, y, txt.length));
            this.time.push(0);
            this.length += 1;
        }
    },

    advanceDraw(dt, ind) {
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
        Drawer.size = this.size[ind];
        this.time[ind] += dt;
        let op, inColor, outColor;
        let eTime = this.time[ind] - 64 * this.pos[ind],
            phTime;
        let txt = this.char[ind], x = this.x[ind],
            y = this.y[ind], sz = this.size[ind],
            off = this.off[ind];
        Drawer.ctx.font = `${sz * Drawer.scale}px monospace`;
        if (eTime < phase5) {
            Drawer.lineWidth = sz / 40;
            if (eTime > phase4) {
                // Phase 5
                phTime = (eTime - phase4) / len5;
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y - sz * phTime,
                    1 - phTime);
                Drawer.color = this.color[ind];
                Drawer.drawText(false, txt, x, y - sz * phTime,
                    1 - phTime);
            } else if (eTime > phase3 || this.time[ind] < 0) {
                // Phase 4
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y);
                Drawer.color = this.color[ind];
                Drawer.drawText(false, txt, x, y);
                if (this.time[ind] < 0 && !this.stopTime) {
                    this.time[ind] = phase4;
                } else if (this.time[ind] > 0 && this.stopTime) {
                    this.time[ind] = -Infinity;
                }
            } else if (eTime > phase2) {
                // Phase 3
                phTime = (eTime - phase2) / len3;
                // Real text
                Drawer.color = "#DDD";
                Drawer.drawText(true, txt, x, y, phTime);
                Drawer.color = this.color[ind];
                Drawer.drawText(false, txt, x, y, phTime);
                // Miscolored text
                Drawer.color = this.color[ind];
                Drawer.drawText(true, txt, x, y, 1 - phTime);
                Drawer.color = "#888";
                Drawer.drawText(false, txt, x, y, 1 - phTime);
            } else if (eTime > phase1) {
                // Phase 2
                phTime = (eTime - phase1) / len2;
                // Miscolored text
                Drawer.color = this.color[ind];
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
            this.char.splice(ind, 1);
            this.x.splice(ind, 1);
            this.y.splice(ind, 1);
            this.pos.splice(ind, 1);
            this.color.splice(ind, 1);
            this.size.splice(ind, 1);
            this.time.splice(ind, 1);
            this.off.splice(ind, 1);
            this.length -= 1;
        }
    }
};
