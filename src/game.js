function update() {
    game.run();
}

var game = {
    time: Date.now(),
    runTime: 0, dt: 0,

    FPS: 40,
    clock: null,

    lastRanMode: null,
    mode: GAME.MENU,
    modeTable: [],

    triggered: {
        wasd: false,
        undo: false
    },

    init(mode) {
        if (typeof mode === 'number') this.mode = mode;
        if (this.clock !== null) {
            clearInterval(this.clock);
        }
        this.clock = setInterval(update, 1000 / this.FPS);
    },

    run(mode = this.mode) {
        this.dt = Date.now() - this.time;
        this.time = Date.now();
        if (this.lastRanMode !== mode) {
            this.lastRanMode = mode;
            this.runTime = 0;
        }
        this.modeTable[this.mode](this.dt);
        this.runTime += this.dt;
    }
};

game.modeTable[GAME.MENU] = function (dt) {
    if (!text.stopTime && game.runTime > 1024) {
        text.stopTime = true;
        text.create("En", 2 * 24 * 0.6, SZ / 2 - 12, COLOR.PURPLE, 24,
            (i, sz) => 1.5 * sz * (Math.random() - 0.5));
        text.create("  tile", 2.5 * 24 * 0.6, SZ / 2 - 16, COLOR.PURPLE, 24,
            (i, sz) => 1.5 * sz * (Math.random() - 0.5));
        text.create("      ment", 3 * 24 * 0.6, SZ / 2 - 12, COLOR.PURPLE, 24,
            (i, sz) => 1.5 * sz * (Math.random() - 0.5));
    } 
    if (game.runTime > 1024 + 1024) {
        text.create("Press any key", SZ / 2, SZ / 2 + 36, COLOR.YELLOW, 12,
            (i, sz) => -0.5 * sz);
        game.runTime = -Infinity;
    }
    if (keyInt.buffered.size > 0) {
        game.mode = GAME.FADE;
    }
    drawer.color = "#000";
    drawer.drawRect(false, 0, 0, SZ, SZ);
    text.drawAll(dt);
};

game.modeTable[GAME.FADE] = function (dt) {
    player.to.pos.x = -8; player.to.pos.y = -8;
    player.to.tar.x = -8; player.to.tar.y = -8;
    level.current = -1;
    text.stopTime = false;
    game.mode = GAME.PASS;
};

game.modeTable[GAME.CONSTRUCT] = function (dt) {
    keyInt.update(dt);
    
    const ttime = 113 / (1 + level.size / 4);
    while (game.runTime > ttime) {
        game.runTime -= ttime;
        let len = (level.reserve.length / 3) | 0;
        if (len > level.size / 2) {
            keyInt.clearBuffer();
        }
        if (len === 1) {
            tile.setTile(level.reserve[0], level.reserve[1], level.reserve[2],
                 false, false);
            game.mode = GAME.PLAY;

            // Reset level variables
            player.canMove = true;
            undo.stepCount = 0;
            undo.tuCount = 0;

            player.scoutAllMoves();
            // Make new movers
            let len = TILE_TRAVEL_TBL[tile.getTile(player.to.tar.x, player.to.tar.y)];
            MoveAnimation.refreshMove(len);
            return;
        }
        let rand = (Math.random() * len) | 0;
        tile.setTile(level.reserve[3 * rand], level.reserve[3 * rand + 1], 
            level.reserve[3 * rand + 2], false, false);
        level.reserve.splice(3 * rand, 3);
    }
    
    if (!player.to.atTarget) {
        player.to.smoothTransition(dt);
    }

    drawer.color = "#000";
    drawer.drawRect(false, 0, 0, SZ, SZ);
    tile.drawAll(dt);
    player.draw();
    text.drawAll(dt);
    moves.drawAll(dt);
};

game.modeTable[GAME.RETRY] = function (dt) {
    keyInt.update(dt);
    
    if (game.runTime === 0) {
        level.load(level.current, false);
        new MoveAnimation(0);
    }
    if (game.runTime > 512) {
        level.reset();
        game.mode = 2;
        return;
    }
    if (!player.to.atTarget) {
        player.to.smoothTransition(dt / (8 - (6 * game.runTime / 512)));
    }

    drawer.color = "#000";
    drawer.drawRect(false, 0, 0, SZ, SZ);
    drawer.op = 1 - (game.runTime / 512);
    tile.drawAll(dt);
    drawer.op = 1;
    player.draw();
    text.drawAll(dt);
    moves.drawAll(dt);
};

game.modeTable[GAME.PLAY] = function (dt) {
    keyInt.update(dt);
    
    if (!player.to.atTarget) {
        player.to.smoothTransition(dt);
    }

    // Debug levels :v
    if (keyInt.isBuffered("e", 500)) {
        keyInt.useBuffer("e");
        level.next();
    } else if (keyInt.isBuffered("q", 500)) {
        keyInt.useBuffer("q");
        new MoveAnimation(0);
        level.load(level.current - 1);
    }

    if (keyInt.isPressed("r", 500)) {
        game.mode = GAME.RETRY;
    }

    // Undo moves
    if (keyInt.isBuffered("z", 500)) {
        keyInt.useBuffer("z");
        if (undo.undoTurn()) {
            player.scoutAllMoves();
            // Make new movers
            let len = TILE_TRAVEL_TBL[tile.getTile(player.to.tar.x, player.to.tar.y)];
            if (len < 0) { player.onDiagonal = true; }
            else { player.onDiagonal = false; }
            MoveAnimation.refreshMove(len);
        }
    }

    // Move player from tile
    if (player.canMove && keyInt.pressDirection(player.onDiagonal)) {
        let dir = keyInt.getDirection(player.onDiagonal);
        let len = player.moveDirection(dir);
        if (len !== false) {
            player.scoutAllMoves();
            MoveAnimation.refreshMove(len);
        }
    }

    // Draw stuff
    drawer.color = "#000";
    drawer.drawRect(false, 0, 0, SZ, SZ);
    tile.drawAll(dt);

    player.draw();
    moves.drawAll(dt);

    text.drawAll(dt);
};
    
game.modeTable[GAME.PASS] = function (dt) {
    if (game.runTime === 0) {
        new MoveAnimation(0);
        if (level.textData[level.current + 1] !== null) {
            let rand = (Math.random() * 4 | 0) * 6 - 12;
            if (rand >= 0) {
                rand += 6;
            }
            text.create(level.textData[level.current + 1],
                10, SZ - 32, level.colorData[level.current + 1], 24,
                i => rand);
        }
    } else if (game.runTime > 512) {
        level.load(level.current + 1);
        return;
    }
    
    if (!player.to.atTarget) {
        player.to.smoothTransition(dt);
    }

    // Draw
    drawer.color = "#000";
    drawer.drawRect(false, 0, 0, SZ, SZ);
    
    drawer.op = 1 - (game.runTime / 512);
    tile.drawAll(dt);
    moves.drawAll(dt);
    drawer.op = 1;
    
    player.draw();
    text.drawAll(dt);
};
