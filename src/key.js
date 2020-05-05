// Key interface set up
var keyInt = {
    // Variables
    pressed: new Map(),
    buffered: new Map(),
    dirCD: 0,

    // Functions
    update(dt) {
        const DISCARD_TIME = 2500;
        let k, v;
        // Update held time on pressed inputs
        for ([k, v] of this.pressed) {
            this.pressed.set(k, v + dt);
        }
        // Update buffered time
        for ([k, v] of this.buffered) {
            if (v + dt > DISCARD_TIME) {
                this.buffered.delete(k);
            } else {
                this.buffered.set(k, v + dt);
            }
        }
        // Update the cooldown on held directions
        if (this.dirCD > 0) {
            if (this.dirCD <= dt) {
                this.dirCD = 0;
            } else {
                this.dirCD -= dt;
            }
        }
    },
    
    pressKey(key) {
        if (!this.pressed.has(key)) {
            this.pressed.set(key, 0);
            this.buffered.set(key, 0);
        }
    },
    
    liftKey(key) {
        this.pressed.delete(key);
    },
    
    isPressed (key) { return this.pressed.has(key); },
    isBuffered (key, maxBuffer = 9999) {
        return this.buffered.has(key) && (this.buffered.get(key) < maxBuffer);
    },
    
    useBuffer (key) { return this.buffered.delete(key); },
    clearBuffer () { this.buffered.clear(); },

    pressDirection (forceDiagonal = false) {
        const BUFFER_TIME = 192;
        // If we are on cooldown for holding a direction, only check for buffered inputs
        if (this.dirCD > 0) {
            if (forceDiagonal) {
                return (this.isBuffered(KEY.UP, BUFFER_TIME) ^ this.isBuffered(KEY.DOWN, BUFFER_TIME)) &&
                    (this.isBuffered(KEY.LEFT, BUFFER_TIME) ^ this.isBuffered(KEY.RIGHT, BUFFER_TIME));
            }
            return this.isBuffered(KEY.UP, BUFFER_TIME) || this.isBuffered(KEY.DOWN, BUFFER_TIME) ||
                this.isBuffered(KEY.RIGHT, BUFFER_TIME) || this.isBuffered(KEY.LEFT, BUFFER_TIME);
        }
        // Else, see if we are pressing a direction
        if (forceDiagonal) {
            return (this.isPressed(KEY.UP) ^ this.isPressed(KEY.DOWN)) &&
                (this.isPressed(KEY.LEFT) ^ this.isPressed(KEY.RIGHT));
        }
        return this.isPressed(KEY.UP) || this.isPressed(KEY.DOWN) ||
            this.isPressed(KEY.RIGHT) || this.isPressed(KEY.LEFT);
    },

    getDirection (forceDiagonal = false) {
        const REPEAT_TIME = 192,
            PRESS_TBL = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        let dirPress = -1, maxBuffer = 9999;
        if (this.isBuffered(KEY.UP, maxBuffer)) {
            if (forceDiagonal) {
                if (this.isPressed(KEY.LEFT)) {
                    maxBuffer = this.buffered.get(KEY.UP);
                    dirPress = 0;
                }
            } else {
                maxBuffer = this.buffered.get(KEY.UP);
                dirPress = 0;
            }
        }
        if (this.isBuffered(KEY.LEFT, maxBuffer)) {
            if (forceDiagonal) {
                if (this.isPressed(KEY.DOWN)) {
                    maxBuffer = this.buffered.get(KEY.LEFT);
                    dirPress = 1;
                }
            } else {
                maxBuffer = this.buffered.get(KEY.LEFT);
                dirPress = 1;
            }
        }
        if (this.isBuffered(KEY.DOWN, maxBuffer)) {
            if (forceDiagonal) {
                if (this.isPressed(KEY.RIGHT)) {
                    maxBuffer = this.buffered.get(KEY.DOWN);
                    dirPress = 2;
                }
            } else {
                maxBuffer = this.buffered.get(KEY.DOWN);
                dirPress = 2;
            }
        }
        if (this.isBuffered(KEY.RIGHT, maxBuffer)) {
            if (forceDiagonal) {
                if (this.isPressed(KEY.UP)) {
                    maxBuffer = this.buffered.get(KEY.RIGHT);
                    dirPress = 3;
                }
            } else {
                maxBuffer = this.buffered.get(KEY.RIGHT);
                dirPress = 3;
            }
        }
        if (dirPress < 0) {
            if (this.pressed.has(KEY.RIGHT)) {
                if (!this.pressed.has(KEY.LEFT)) {
                    this.dirCD = REPEAT_TIME;
                    return new Vec2(1, 0);
                }
            } else if (this.pressed.has(KEY.LEFT)) {
                this.dirCD = REPEAT_TIME;
                return new Vec2(-1, 0);
            }
            if (this.pressed.has(KEY.DOWN)) {
                if (!this.pressed.has(KEY.UP)) {
                    this.dirCD = REPEAT_TIME;
                    return new Vec2(0, 1);
                }
            } else if (this.pressed.has(KEY.UP)) {
                this.dirCD = REPEAT_TIME;
                return new Vec2(0, -1);
            }
        } else {
            if (dirPress == 0) {
                this.buffered.delete(KEY.UP);
            } else if (dirPress == 1) {
                this.buffered.delete(KEY.LEFT);
            } else if (dirPress == 2) {
                this.buffered.delete(KEY.DOWN);
            } else if (dirPress == 3) {
                this.buffered.delete(KEY.RIGHT);
            }
            this.dirCD = REPEAT_TIME;
            return new Vec2(PRESS_TBL[dirPress][0], PRESS_TBL[dirPress][1]);
        }
    }
};

onkeydown = e => keyInt.pressKey(e.key.toLowerCase());
onkeyup = e => keyInt.liftKey(e.key.toLowerCase());
