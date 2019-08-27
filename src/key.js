// Key input set up
var key = (class {
    constructor () {
        this.pressed = [];
        this.buffered = [];
        this.cd = 0;
        this.dirPress = null;
    }

    isPressed (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.pressed.includes(keys[i])) {
                return true;
            }
        }
        return false;
    }
    isBuffered (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.buffered.includes(keys[i])) {
                return true;
            }
        }
        return false;
    }
    useBuffer (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.buffered.includes(keys[i])) {
                this.buffered.splice(this.buffered.indexOf(keys[i]), 1);
            }
        }
    }
    clearBuffer () {
        this.buffered = [];
    }

    pressDirection () {
        if (key.cd > 0) {
            return false;
        }
        return this.isPressed("w", "a", "s", "d");
    }

    getDirection () {
        const cooldown = 192,
            pressTbl = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0] };
        if (this.isBuffered("w")) {
            this.useBuffered("w");
            this.dirPress = "w";
        } else if (this.isBuffered("a")) {
            this.useBuffered("a");
            this.dirPress = "a";
        } else if (this.isBuffered("s")) {
            this.useBuffered("s");
            this.dirPress = "s";
        } else if (this.isBuffered("d")) {
            this.useBuffered("d");
            this.dirPress = "d";
        }
        if (!this.pressed.includes(this.dirPress)) {
            let x = this.pressed.includes("d");
            x += (x - 1) * this.pressed.includes("a");
            if (x !== 0) {
                key.cd = cooldown;
                return new Vec2(x, 0);
            }
            let y = this.pressed.includes("s");
            y += (y - 1) * this.pressed.includes("w");
            if (y !== 0) {
                key.cd = cooldown;
            }
            return new Vec2(0, y);
        } else {
            key.cd = cooldown;
            return new Vec2(...pressTbl[this.dirPress]);
        }
    }
})();
onkeydown = e => {
    if (!key.pressed.includes(e.key.toLowerCase())) {
        key.pressed.push(e.key.toLowerCase());
        if (!key.buffered.includes(e.key.toLowerCase())) {
            key.buffered.push(e.key.toLowerCase());
            key.cd = 0;
        }
    }
};
onkeyup = e => {
    if (key.pressed.includes(e.key.toLowerCase())) {
        key.pressed.splice(key.pressed.indexOf(e.key.toLowerCase()), 1);
    }
};
