////////////////////////////////////////////////////////////////////////////////
// Enumerated constants
var TILE = {
    NULL:         -1,
    BLUE:          0,
    RED:           1,
    GREEN:         2,
    PURPLE:        3,
    ORANGE:        4,
    STEEL:         5,
    DOUBLE_BLUE:   6,
    DOUBLE_RED:    7,
    DOUBLE_ORANGE: 8,
    ORANGE_RED:    9,
    ORANGE_GREEN: 10,
    YELLOW:       11,
    ICE_BLUE:     12,
    ICE:          13,
    ICE_RED:      14,
    ICE_GREEN:    15,
    WALL:         16
};
var TILE_ANIM = {
    BLUE:          0,
    RED:           1,
    GREEN:         2,
    ORANGE:        4,
    DOUBLE_BLUE:   6,
    DOUBLE_RED:    7,
    DOUBLE_ORANGE: 8,
    ORANGE_RED:    9,
    ORANGE_GREEN: 10,
    YELLOW:       11,
    ICE:          13
};
var MOVES_PHASE = {
    FADE_IN:  0,
    MOVE:     1,
    STAY:     2,
    SPLIT:    3,
    FADE_OUT: 4,
    DELETE:   5
};
var MOVES = {
    WHITE: 0,
    RED:   1,
    GOLD:  2
};

var SCOUT_CODE = {
    INVALID: 0,
    VALID:   1,
    END:     2
};

////////////////////////////////////////////////////////////////////////////////
// Named constants
var COLOR = {
    WHITE:     "#EEE",
    LIGHT_RED: "#E77",
    GOLD:      "#ED7",
    
    BLUE:   "#00E",
    RED:    "#E00",
    GREEN:  "#0E0",
    PURPLE: "#A0A",
    ORANGE: "#E70",
    STEEL:  "#AAA",
    YELLOW: "#EE0",
    ICE:    "#4EE"
};
var KEY = {
    UP:   "w", DOWN:  "s",
    LEFT: "a", RIGHT: "d",
    UNDO: "z", REDO:  "r",
    SKIP: "e", BACK:  "q"
    // DISP: "p", DISP_UP: "k",
    // DISP_DOWN: "i"
};



////////////////////////////////////////////////////////////////////////////////
// Tables
var TILE_COLOR = { OUTER_TBL: [], INNER_TBL: [] };

TILE_COLOR.OUTER_TBL[TILE.BLUE]   = COLOR.BLUE;
TILE_COLOR.OUTER_TBL[TILE.RED]    = COLOR.RED;
TILE_COLOR.OUTER_TBL[TILE.GREEN]  = COLOR.GREEN;
TILE_COLOR.OUTER_TBL[TILE.PURPLE] = COLOR.PURPLE;
TILE_COLOR.OUTER_TBL[TILE.ORANGE] = COLOR.ORANGE;
TILE_COLOR.OUTER_TBL[TILE.STEEL]  = COLOR.STEEL;
TILE_COLOR.OUTER_TBL[TILE.DOUBLE_BLUE] = COLOR.BLUE;
TILE_COLOR.OUTER_TBL[TILE.DOUBLE_RED]  = COLOR.RED;
TILE_COLOR.OUTER_TBL[TILE.DOUBLE_ORANGE] = COLOR.ORANGE;
TILE_COLOR.OUTER_TBL[TILE.ORANGE_RED]   = COLOR.ORANGE;
TILE_COLOR.OUTER_TBL[TILE.ORANGE_GREEN] = COLOR.ORANGE;
TILE_COLOR.OUTER_TBL[TILE.YELLOW]    = COLOR.YELLOW;
TILE_COLOR.OUTER_TBL[TILE.ICE_BLUE]  = COLOR.ICE;
TILE_COLOR.OUTER_TBL[TILE.ICE]       = COLOR.ICE;
TILE_COLOR.OUTER_TBL[TILE.ICE_RED]   = COLOR.ICE;
TILE_COLOR.OUTER_TBL[TILE.ICE_GREEN] = COLOR.ICE;
TILE_COLOR.OUTER_TBL[TILE.WALL]      = COLOR.STEEL;

TILE_COLOR.INNER_TBL[TILE.BLUE]   = null;
TILE_COLOR.INNER_TBL[TILE.RED]    = null;
TILE_COLOR.INNER_TBL[TILE.GREEN]  = null;
TILE_COLOR.INNER_TBL[TILE.PURPLE] = null;
TILE_COLOR.INNER_TBL[TILE.ORANGE] = null;
TILE_COLOR.INNER_TBL[TILE.STEEL]  = null;
TILE_COLOR.INNER_TBL[TILE.DOUBLE_BLUE] = COLOR.BLUE;
TILE_COLOR.INNER_TBL[TILE.DOUBLE_RED]  = COLOR.RED;
TILE_COLOR.INNER_TBL[TILE.DOUBLE_ORANGE] = COLOR.ORANGE;
TILE_COLOR.INNER_TBL[TILE.ORANGE_RED]   = COLOR.RED;
TILE_COLOR.INNER_TBL[TILE.ORANGE_GREEN] = COLOR.GREEN;
TILE_COLOR.INNER_TBL[TILE.YELLOW]    = null;
TILE_COLOR.INNER_TBL[TILE.ICE_BLUE]  = COLOR.BLUE;
TILE_COLOR.INNER_TBL[TILE.ICE]       = null;
TILE_COLOR.INNER_TBL[TILE.ICE_RED]   = COLOR.RED;
TILE_COLOR.INNER_TBL[TILE.ICE_GREEN] = COLOR.GREEN;
TILE_COLOR.INNER_TBL[TILE.WALL]      = COLOR.STEEL;

var MOVES_COLOR = [];
MOVES_COLOR[MOVES.WHITE] = COLOR.WHITE;
MOVES_COLOR[MOVES.RED]   = COLOR.LIGHT_RED;
MOVES_COLOR[MOVES.GOLD]  = COLOR.GOLD;

var TILE_TRAVEL_TBL = [];
TILE_TRAVEL_TBL[TILE.BLUE]   = 1;
TILE_TRAVEL_TBL[TILE.RED]    = 2;
TILE_TRAVEL_TBL[TILE.GREEN]  = 3;
TILE_TRAVEL_TBL[TILE.PURPLE] = 0;
TILE_TRAVEL_TBL[TILE.ORANGE] = 1;
TILE_TRAVEL_TBL[TILE.STEEL]  = 1;
TILE_TRAVEL_TBL[TILE.DOUBLE_BLUE] = -1;
TILE_TRAVEL_TBL[TILE.DOUBLE_RED]  = -2;
TILE_TRAVEL_TBL[TILE.DOUBLE_ORANGE] = 1;
TILE_TRAVEL_TBL[TILE.ORANGE_RED]   = 2;
TILE_TRAVEL_TBL[TILE.ORANGE_GREEN] = 3;
TILE_TRAVEL_TBL[TILE.YELLOW]    = Infinity;
TILE_TRAVEL_TBL[TILE.ICE_BLUE]  = 1;
TILE_TRAVEL_TBL[TILE.ICE]       = 0;
TILE_TRAVEL_TBL[TILE.ICE_RED]   = 2;
TILE_TRAVEL_TBL[TILE.ICE_GREEN] = 3;
TILE_TRAVEL_TBL[TILE.WALL]      = 0;
