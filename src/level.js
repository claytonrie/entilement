var level = {
    current: null,
    reserve: [], size: 0,

    next() {
        game.mode = GAME.PASS;
    },

    reset() {
        // Reset everything
        let i = tile.max - 1;
        for (; i >= 0 ; i -= 1) {
            tile.type[i] = TILE.NULL;
        }
        tile.count = 0;
        tileAnim.length = 0;
    },

    load(num, setMode = true) {
        if (setMode) {
            game.mode = GAME.CONSTRUCT;
            this.reset();
        }
        
        // Clear the data reserve buffer
        this.reserve = []; this.size = 0;
        if (LEVEL.DATA.length >= num) {
            num %= LEVEL.DATA.length;
        } else if (num < 0) {
            num += LEVEL.DATA.length;
        }
        this.decode(LEVEL.DATA[num]);
        this.current = num;
    },
    
    decode(str) {
        function stringToNum(bwte) {
            return LEVEL.CHAR_TABLE.indexOf(bwte);
        }
        
        let pos = 0, type = 0, count = 0, horz;
        
        // Sanity check: Does the level data start with a space
        // From a pure ASCII file, we might use spaces to seperate levels
        if (str.substr(pos++, 1) !== " ") {
            throw new Error("Invalid level code!");
        }
        // The next two digits constitute the player's start position
        player.to.tar.x = stringToNum(str.substr(pos++, 1)) * 16 + 8;
        player.to.tar.y = stringToNum(str.substr(pos++, 1)) * 16 + 8;
        player.to.resetTransition();
        
        while (pos < str.length) {
            if (stringToNum(str[pos]) >= 64) {
                // If the value is greater than 64, the next coordinate forms
                //   a line object with a length dependant on this value
                count = stringToNum(str[pos]) - 64;
                if (count > 13) {
                    count -= 13;
                    horz = false;
                } else {
                    count += 1;
                    horz = true;
                }
                pos += 1;
            } else if (stringToNum(str[pos]) >= 16) {
                // If the value is greater than 16, all the tiles reserved after
                //   this is of type (val - 16)
                type = stringToNum(str[pos]) - 16;
                pos += 1;
            } else {
                // reserve a tile / line of tiles based on the coordinates
                if (count > 0) {
                    let i = count, x = stringToNum(str.substr(pos++, 1)), 
                        y = stringToNum(str.substr(pos++, 1));
                    for (; i >= 0; i -= 1) {
                        this.reserve.push(type, x + horz * i, y + (!horz) * i);
                    }
                    this.size += count;
                } else {
                    this.reserve.push(type, stringToNum(str.substr(pos++, 1)), 
                        stringToNum(str.substr(pos++, 1)));
                    this.size += 1;
                }
                count = 0;
            }
        }
    }
};
