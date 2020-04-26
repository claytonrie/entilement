class Vec2 {
    constructor (x = 0, y = 0, mag = null) {
        this.x = x;
        this.y = y;
        // __mag is the internal tracking of the magnitude of the vactor
        // It doesn't get calculated until Vec2.mag is read or set
        this.__mag = mag;
    }
    
    clone() {
        return new Vec2(this.x, this.y, this.__mag);
    }
    static clone(v) {
        return new Vec2(v.x, v.y, v.__mag)
    }
    
    add (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    addEq (v) {
        this.x += v.x; this.y += v.y;
        if (this.__mag !== null && Vec2.cross(this, v) === 0) {
            this.__mag += v.mag;
        } else {
            this.__mag = null;
        }
        return this;
    }
    static add(v1, v2) { return new Vec2(v1.x + v2.x, v1.y + v2.y); }
    
    // Scale-Add-Scale: scales v1 by a and v2 by b and adds their sum
    // add(v1, v2) is equal to scAddSc(1, v1,  1, v2)
    //  to(v1, v2) is equal to scAddSc(1, v2, -1, v1)
    static scAddSc(a, v1, b, v2) {
        return new Vec2(a * v1.x + b * v2.x, a * v1.y + b * v2.y);
    }
    
    to (v) { return new Vec2(v.x - this.x, v.y - this.y); }
    static diff(v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y); }
    
    //
    /// Scalar-returning functions
    //
    sqDist () { return this.x * this.x + this.y * this.y; }
    static sqDist (v1, v2 = null) {
        if (v2) {
            return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y);
        } else {
            return v1.x * v1.x + v1.y * v1.y;
        }
    }
    
    dot(v) { return this.x * v.x + this.y * v.y; }
    static dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
    
    cross(v) { return this.x * v.y - this.y * v.x; }
    static cross(v1, v2) { return v1.x * v2.y - v1.y * v2.x; }
    // The cross product of v1 and v2 where v3 is taken as the origin
    static crossRel(v1, v2, v3) { return (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x); }
    
    //
    /// Vector-returning functions
    //
    scale(sc) {
        return new Vec2(sc * this.x, sc * this.y, 
            (this.__mag !== null ? Math.abs(sc) * this.__mag : null));
    }
    scaleEq(sc) {
        this.x *= sc;
        this.y *= sc;
        if (this.__mag !== null) {
            this.__mag *= Math.abs(sc);
        }
        return this;
    }
    static scale(sc, v) {
        return new Vec2(sc * v.x, sc * v.y, 
            (v.__mag !== null ? Math.abs(sc) * v.__mag : null));
    }
    
    normalize(len = 1) {
        let rtV2 = new Vec2(this.x, this.y, this.__mag);
        rtV2.mag = len;
        return rtV2;
    }
    normEq(len = 1) {
        this.mag = len;
        return this;
    }
    static normalize(v, len = 1) {
        let rtV2 = new Vec2(v.x, v.y, v.__mag);
        rtV2.mag = len;
        return rtV2;
    }
    
    perp(sc = 1) {
        return new Vec2(-sc * this.y, sc * this.x, this.__mag !== null ? Math.abs(sc) * this.__mag : null);
    }
    static perp(v, sc = 1) {
        return new Vec2(-sc * v.y, sc * v.x, v.__mag !== null ? Math.abs(sc) * this.__mag : null);
    }
    
    get mag() {
        if (this.__mag === null) {
            this.__mag = this.x * this.x + this.y * this.y;
            this.__mag **= 0.5; 
        }
        return this.__mag;
    }
    set mag(val) {
        if (this.__mag === null) {
            this.__mag = this.x * this.x + this.y * this.y;
            this.__mag **= 0.5; 
        }
        let mult = val / this.__mag;
        this.x *= mult;
        this.y *= mult;
        this.__mag = Math.abs(val);
        return this.__mag;
    }
    
    toString() {
        return `Vec2{${this.x}, ${this.y}}`;
    }
}
