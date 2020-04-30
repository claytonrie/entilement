var SZ;
const SIZE = 256, SCALE = 2;

var drawer = (function() {
    let cv = document.createElement("canvas");
    cv.height = SCALE * SIZE;
    cv.width = SCALE * SIZE;
    document.body.appendChild(cv);
    
    // private variables
    let __scale = SCALE,
        __size  = SIZE;
    let __font  = 16,
        __lWidth = SCALE; 
    let __color = "#000";
    
    return {
        // Public variables
        cv: cv,
        ctx: cv.getContext("2d"),
        op: 1,
        
        // Getter/Setters
        get size() { return __size; },
        set size(val) {
            this.cv.height = __scale * val;
            this.cv.width = __scale * val;
            return __size = val;
        },
        
        get scale() { return __scale; },
        set scale(val) {
            this.cv.height = __size * val;
            this.cv.width = __size * val;
            return __scale = val;
        },

        get color() { return __color; },
        set color(val) {
            this.ctx.fillStyle = val;
            this.ctx.strokeStyle = val;
            return __color = val;
        },

        get lineWidth() { return __lWidth; },
        set lineWidth(val) {
            this.ctx.lineWidth = val * this.scale;
            return __lWidth = val;
        },
    
        get font() { return __font; },
        set font(val) {
            this.ctx.font = `${(val * __scale) | 0}px monospace`;
            return __font = val;
        },
        
        // Methods
        setColor(val) {
            this.color = val; return this;
        },
        setLineWidth(val) {
            this.lineWidth = val; return this;
        },
        setOp(val) {
            this.op = val; return this;
        },
        setSize(val) {
            this.size = val;
            return this;
        },

        drawRect(stroke, x, y, w = 1, h = 1, op = 1, useDim = 1) {
            // This bit of code is to allow use to substitute vectors
            //   for the coordinate pairs
            let rx, ry, rw, rh, dim, rop; // The "real" inputs
            if (typeof x !== 'number') {
                if (typeof y !== 'number') {
                    rx = x.x; ry = x.y;
                    rw = y.x; rh = y.y;
                    rop = w; dim = h;
                } else {
                    rx = x.x; ry = x.y;
                    rw = y; rh = w;
                    rop = h; dim = op;
                }
            } else if (typeof w !== 'number') {
                rx = x; ry = y;
                rw = w.x; rh = w.y;
                rop = h; dim = op;
            } else {
                rx = x; ry = y;
                rw = w; rh = h;
                rop = op; dim = useDim;
            }
            // If we are using two positions instead of width and height
            // Find the width and height
            if (!dim) {
                rw -= rx;
                rh -= ry;
            }
            rx *= __scale; ry *= __scale;
            rw *= __scale; rh *= __scale;

            this.ctx.globalAlpha = rop * this.op;
            if (stroke) {
                let lnFact = __lWidth * __scale / 2;
                this.ctx.strokeRect(rx + lnFact, ry + lnFact,
                    rw - 2 * lnFact, rh - 2 * lnFact);
            } else {
                this.ctx.fillRect(rx, ry, rw, rh);
            }
        },

        drawCirc(stroke, x, y, r = 1, op = 1) {
            let rx, ry, rr, rop;
            if (typeof x !== 'number') {
                rx = x.x; ry = x.y;
                rr = y;
                rop = r;
            } else {
                rx = x; ry = y;
                rr = r;
                rop = op;
            }
            rx *= __scale; ry *= __scale;
            rr *= __scale;

            this.ctx.beginPath();
            this.ctx.globalAlpha = rop * this.op;
            if (stroke) {
                let lnFact = __lWidth * __scale / 2;
                this.ctx.moveTo(rx + rr - lnFact, ry);
                this.ctx.arc(rx, ry, rr - lnFact, 0, 6.28318531);
                this.ctx.stroke();
            } else {
                this.ctx.moveTo(rx + rr, ry);
                this.ctx.arc(rx, ry, rr, 0, 6.28318531);
                this.ctx.fill();
            }
        },
    
        drawText(stroke, txt, x, y = 1, op = 1) {
            let rx, ry, rop;
            if (typeof x !== 'number') {
                rx = x.x; ry = x.y;
                rop = y;
            } else {
                rx = x; ry = y;
                rop = op;
            }
            rx *= __scale; ry *= __scale;

            this.ctx.globalAlpha = rop * this.op;
            if (stroke) {
                this.ctx.strokeText(txt, rx, ry);
            } else {
                this.ctx.fillText(txt, rx, ry);
            }
        },

        path   () { this.ctx.beginPath(); return this; },
        fill   (op = 1) { 
            this.ctx.globalAlpha = op * this.op;
            this.ctx.fill();
            return this;
        },
        stroke (op = 1) {
            this.ctx.globalAlpha = op * this.op;
            this.ctx.stroke();
            return this;
        },
        draw (stroke, op = 1) {
            this.ctx.globalAlpha = op * this.op;
            if (stroke) { this.stroke(); } else { this.fill(); }
        },
        moveTo (x, y) {
            if (typeof x !== 'number') {
                this.ctx.moveTo(__scale * x.x, __scale * x.y);
            } else {
                this.ctx.moveTo(__scale * x, __scale * y);
            }
            return this;
        },
        lineTo (x, y) {
            if (typeof x !== 'number') {
                this.ctx.lineTo(__scale * x.x, __scale * x.y);
            } else {
                this.ctx.lineTo(__scale * x, __scale * y);
            }
            return this;
        }
    }
})();
