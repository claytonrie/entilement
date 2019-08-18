var SZ;
var Drawer = new (class {
    constructor (size, scale = 1) {
        this.cv = document.createElement("canvas");
        this.cv.height = scale * size;
        this.cv.width = scale * size;
        document.body.appendChild(this.cv);
        this.ctx = this.cv.getContext("2d");
        SZ = this.size = size;
        this.scale = scale;

        this.__COLOR__ = "#000";
        this.__LWIDTH__ = this.scale;
        this.__OP__ = 1;
        return this;
    }

    get color() {
        return this.__COLOR__;
    }
    set color(val) {
        this.ctx.fillStyle = val;
        this.ctx.strokeStyle = val;
        return this.__COLOR__ = val;
    }
    setColor(val) {
        this.color = val;
        return this;
    }

    get lineWidth() {
        return this.__LWIDTH__;
    }
    set lineWidth(val) {
        this.ctx.lineWidth = val * this.scale;
        return this.__LWIDTH__ = val;
    }
    setLineWidth(val) {
        this.lineWidth = val;
        return this;
    }
    
    get op() {
        return this.__OP__;
    }
    set op(val) {
        return this.__OP__ = val;
    }
    setOp(val) {
        this.op = val;
        return this;
    }
    
    get size() {
        return this.__SIZE__;
    }
    set size(val) {
        this.ctx.font = `${val * this.scale}px monospace`;
        return this.__SIZE__ = val;
    }
    setSize(val) {
        this.size = val;
        return this;
    }

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
        rx *= this.scale; ry *= this.scale;
        rw *= this.scale; rh *= this.scale;

        this.ctx.globalAlpha = rop * this.__OP__;
        if (stroke) {
            let lnFact = this.lineWidth * this.scale / 2;
            this.ctx.strokeRect(rx + lnFact, ry + lnFact,
                rw - 2 * lnFact, rh - 2 * lnFact);
        } else {
            this.ctx.fillRect(rx, ry, rw, rh);
        }
    }

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
        rx *= this.scale; ry *= this.scale;
        rr *= this.scale;

        this.ctx.beginPath();
        this.ctx.globalAlpha = rop * this.__OP__;
        if (stroke) {
            let lnFact = this.lineWidth * this.scale / 2;
            this.ctx.moveTo(rx + rr - lnFact, ry);
            this.ctx.arc(rx, ry, rr - lnFact, 0, 6.28318531);
            this.ctx.stroke();
        } else {
            this.ctx.moveTo(rx + rr, ry);
            this.ctx.arc(rx, ry, rr, 0, 6.28318531);
            this.ctx.fill();
        }
    }
    
    drawText(stroke, txt, x, y = 1, op = 1) {
        let rx, ry, rop;
        if (typeof x !== 'number') {
            rx = x.x; ry = x.y;
            rop = y;
        } else {
            rx = x; ry = y;
            rop = op;
        }
        rx *= this.scale; ry *= this.scale;

        this.ctx.globalAlpha = rop * this.__OP__;
        if (stroke) {
            this.ctx.strokeText(txt, rx, ry);
        } else {
            this.ctx.fillText(txt, rx, ry);
        }
    }

    path   () { this.ctx.beginPath(); return this; }
    fill   (op = 1) { 
        this.ctx.globalAlpha = op * this.__OP__;
        this.ctx.fill();
        return this;
    }
    stroke (op = 1) {
        this.ctx.globalAlpha = op * this.__OP__;
        this.ctx.stroke();
        return this;
    }
    draw (stroke, op = 1) {
        this.ctx.globalAlpha = op * this.__OP__;
        if (stroke) { this.stroke(); } else { this.fill(); }
    }
    moveTo (x, y) {
        if (typeof x !== 'number') {
            this.ctx.moveTo(this.scale * x.x, this.scale * x.y);
        } else {
            this.ctx.moveTo(this.scale * x, this.scale * y);
        }
        return this;
    }
    lineTo (x, y) {
        if (typeof x !== 'number') {
            this.ctx.lineTo(this.scale * x.x, this.scale * x.y);
        } else {
            this.ctx.lineTo(this.scale * x, this.scale * y);
        }
        return this;
    }
})(256, 2);
