var text = {
    // Variables
    // possibly TODO: change these into typed arrays?
    char: new Array(TEXT_MAX),
    x: new Uint16Array(TEXT_MAX),
    y: new Uint16Array(TEXT_MAX),
    off: new Int8Array(TEXT_MAX),
    size: new Uint8Array(TEXT_MAX),
    time: new Int16Array(TEXT_MAX),
    phase: new Uint8Array(TEXT_MAX),
    group: new Uint8Array(TEXT_MAX),
    grStay: new Int16Array(256),
    grColor: new Array(256),
    grLength: 0,
    length: 0,

    // Methods
    drawAll (dt) {
        let i = this.length - 1;
        for (; i >= 0; i -= 1) {
            this.advanceDraw(dt, i);
        }
    },
    
    deleteChar(ind) {
    	if (ind === this.length - 1) {
        	this.char[ind] = null;
        	this.length -= 1;
        } else {
        	this.length -= 1;
        	this.char[ind]  = this.char[this.length];
            this.char[this.length] = null;
        	this.x[ind]     = this.x[this.length];
        	this.y[ind]     = this.y[this.length];
        	this.off[ind]   = this.off[this.length];
        	this.size[ind]  = this.size[this.length];
        	this.phase[ind] = this.phase[this.length];
        	this.time[ind]  = this.time[this.length];
        	this.group[ind] = this.group[this.length];
        }
    },
    
    create (txt, x, y, size, color, stay, group, delay = 0, off = (i => 0)) {
        let gr;
        if (group === 255) {
        	gr = this.grLength;
            this.grLength += 1;
        } else {
        	gr = group;
            if (this.grLength <= group) {
            	this.grLength = group + 1;
            }
        }
        this.grColor[gr] = color;
        this.grStay[gr] = stay;
        
        let i = txt.length - 1;
        for (; i >= 0; i -= 1) {
            if (txt[i] === " ") {
                continue;
            }
            this.char[this.length] = txt[i];
            this.x[this.length] = x + 0.5 * size * i;
            this.y[this.length] = y;
            this.size[this.length] = size;
            this.off[this.length] = off(i, size, 
            	x + 0.5 * size * i, y, txt.length);
            this.phase[this.length] = 0;
            this.time[this.length] = delay - 64 * i;
            this.group[this.length] = gr;
            this.length += 1;
        }
        return delay - 64 * txt.length;
    },

    advanceDraw(dt, ind) {
    	let x = this.x[ind],
            y = this.y[ind],
            char = this.char[ind],
            size = this.size[ind],
            off = this.off[ind];
    	let group = this.group[ind],
        	phase = this.phase[ind];
        let phase_len = TEXT_TIME[phase];
        let color = this.grColor[group],
        	stay_len = this.grStay[group];
        let time = this.time[ind], 
            perc = time / phase_len;
        
        drawer.font = size;
        drawer.lineWidth = size / 40;
    	if (phase === TEXT_PHASE.APPEAR) {
            // Draw nothing, wait for letter to appear
        } else if (phase === TEXT_PHASE.SHIFT) {
            // Fade in and lift up
            drawer.color = "#FFF";
            drawer.drawText(true, char, x + off, y + size * (1 - perc), perc);
        } else if (phase === TEXT_PHASE.COMB) {
            // Miscolored text
            drawer.color = color;
            drawer.drawText(true, char, x, y, perc);
            drawer.color = "#888";
            drawer.drawText(false, char, x, y, perc);
            // Stroke text
            drawer.color = "#FFF";
            drawer.drawText(true, char, x + off * (1 - perc), y, 1 - perc);
        } else if (phase === TEXT_PHASE.RECOLOR) {
            // Properly colored text
            drawer.color = "#DDD";
            drawer.drawText(true, char, x, y, perc);
            drawer.color = color;
            drawer.drawText(false, char, x, y, perc);
            // Miscolored text
            drawer.color = color;
            drawer.drawText(true, char, x, y, 1 - perc);
            drawer.color = "#888";
            drawer.drawText(false, char, x, y, 1 - perc);
        } else if (phase === TEXT_PHASE.STAY) {
        	phase_len = stay_len;
            drawer.color = "#DDD";
            drawer.drawText(true, char, x, y);
            drawer.color = color;
            drawer.drawText(false, char, x, y);
        } else if (phase === TEXT_PHASE.FADE) {
            drawer.color = "#DDD";
            drawer.drawText(true, char, x, y - size * perc,
                            1 - perc);
            drawer.color = color;
            drawer.drawText(false, char, x, y - size * perc,
                            1 - perc);
        }
        this.time[ind] += dt;
        if (phase_len >= 0 && time + dt >= phase_len) {
        	this.time[ind] -= phase_len;
            if (phase_len === 0) { this.time[ind] = 0; }
            this.phase[ind] += 1;
        }
        if (this.phase[ind] === TEXT_PHASE.DELETE) {
        	this.deleteChar(ind);
            return true;
        }
        return false;
    }
};
