if (gIncludedFiles == undefined)
 alert("You must include this file");

gIncludedFiles.push("InputManager.js");
include("transform.js");


/**
 * Input Class
 */

InputManager = function(){
    this.keyStatus = {};
    this.mouseButton = "";

    this.tabArray = [];
    this.tabArray["CANCEL"] = InputManager.keyEventEnum.DOM_VK_CANCEL;
    this.tabArray["HELP"] = InputManager.keyEventEnum.DOM_VK_HELP;
    this.tabArray["BACKSPACE"] = InputManager.keyEventEnum.DOM_VK_BACK_SPACE;
    this.tabArray["TAB"] = InputManager.keyEventEnum.DOM_VK_TAB;
    this.tabArray["CLEAR"] = InputManager.keyEventEnum.DOM_VK_CLEAR;
    this.tabArray["RETURN"] = InputManager.keyEventEnum.DOM_VK_RETURN;
    this.tabArray["ENTER"] = InputManager.keyEventEnum.DOM_VK_ENTER;
    this.tabArray["SHIFT"] = InputManager.keyEventEnum.DOM_VK_SHIFT;
    this.tabArray["CONTROL"] = InputManager.keyEventEnum.DOM_VK_CONTROL;
    this.tabArray["ALT"] = InputManager.keyEventEnum.DOM_VK_ALT;
    this.tabArray["PAUSE"] = InputManager.keyEventEnum.DOM_VK_PAUSE;
    this.tabArray["CAPSLOCK"] = InputManager.keyEventEnum.DOM_VK_CAPS_LOCK;
    this.tabArray["ESCAPE"] = InputManager.keyEventEnum.DOM_VK_ESCAPE;
    this.tabArray["SPACE"] = InputManager.keyEventEnum.DOM_VK_SPACE;
    this.tabArray["PAGEUP"] = InputManager.keyEventEnum.DOM_VK_PAGE_UP;
    this.tabArray["PAGEDOWN"] = InputManager.keyEventEnum.DOM_VK_PAGE_DOWN;
    this.tabArray["END"] = InputManager.keyEventEnum.DOM_VK_END;
    this.tabArray["HOME"] = InputManager.keyEventEnum.DOM_VK_HOME;
    this.tabArray["LEFT"] = InputManager.keyEventEnum.DOM_VK_LEFT;
    this.tabArray["UP"] = InputManager.keyEventEnum.DOM_VK_UP;
    this.tabArray["RIGHT"] = InputManager.keyEventEnum.DOM_VK_RIGHT;
    this.tabArray["DONW"] = InputManager.keyEventEnum.DOM_VK_DOWN;
    this.tabArray["PRINTSCREEN"] = InputManager.keyEventEnum.DOM_VK_PRINTSCREEN;
    this.tabArray["INSERT"] = InputManager.keyEventEnum.DOM_VK_INSERT;
    this.tabArray["DELETE"] = InputManager.keyEventEnum.DOM_VK_DELETE;
    this.tabArray["0"] = InputManager.keyEventEnum.DOM_VK_0;
    this.tabArray["1"] = InputManager.keyEventEnum.DOM_VK_1;
    this.tabArray["2"] = InputManager.keyEventEnum.DOM_VK_2;
    this.tabArray["3"] = InputManager.keyEventEnum.DOM_VK_3;
    this.tabArray["4"] = InputManager.keyEventEnum.DOM_VK_4;
    this.tabArray["5"] = InputManager.keyEventEnum.DOM_VK_5;
    this.tabArray["6"] = InputManager.keyEventEnum.DOM_VK_6;
    this.tabArray["7"] = InputManager.keyEventEnum.DOM_VK_7;
    this.tabArray["8"] = InputManager.keyEventEnum.DOM_VK_8;
    this.tabArray["9"] = InputManager.keyEventEnum.DOM_VK_9;
    this.tabArray["SEMICOLON"] = InputManager.keyEventEnum.DOM_VK_SEMICOLON;
    this.tabArray["EQUAL"] = InputManager.keyEventEnum.DOM_VK_EQUALS;
    this.tabArray["A"] = InputManager.keyEventEnum.DOM_VK_A;
    this.tabArray["B"] = InputManager.keyEventEnum.DOM_VK_B;
    this.tabArray["C"] = InputManager.keyEventEnum.DOM_VK_C;
    this.tabArray["D"] = InputManager.keyEventEnum.DOM_VK_D;
    this.tabArray["E"] = InputManager.keyEventEnum.DOM_VK_E;
    this.tabArray["F"] = InputManager.keyEventEnum.DOM_VK_F;
    this.tabArray["G"] = InputManager.keyEventEnum.DOM_VK_G;
    this.tabArray["H"] = InputManager.keyEventEnum.DOM_VK_H;
    this.tabArray["I"] = InputManager.keyEventEnum.DOM_VK_I;
    this.tabArray["J"] = InputManager.keyEventEnum.DOM_VK_J;
    this.tabArray["K"] = InputManager.keyEventEnum.DOM_VK_K;
    this.tabArray["L"] = InputManager.keyEventEnum.DOM_VK_L;
    this.tabArray["M"] = InputManager.keyEventEnum.DOM_VK_M;
    this.tabArray["N"] = InputManager.keyEventEnum.DOM_VK_N;
    this.tabArray["O"] = InputManager.keyEventEnum.DOM_VK_O;
    this.tabArray["P"] = InputManager.keyEventEnum.DOM_VK_P;
    this.tabArray["Q"] = InputManager.keyEventEnum.DOM_VK_Q;
    this.tabArray["R"] = InputManager.keyEventEnum.DOM_VK_R;
    this.tabArray["S"] = InputManager.keyEventEnum.DOM_VK_S;
    this.tabArray["T"] = InputManager.keyEventEnum.DOM_VK_T;
    this.tabArray["U"] = InputManager.keyEventEnum.DOM_VK_U;
    this.tabArray["V"] = InputManager.keyEventEnum.DOM_VK_V;
    this.tabArray["W"] = InputManager.keyEventEnum.DOM_VK_W;
    this.tabArray["X"] = InputManager.keyEventEnum.DOM_VK_X;
    this.tabArray["Y"] = InputManager.keyEventEnum.DOM_VK_Y;
    this.tabArray["Z"] = InputManager.keyEventEnum.DOM_VK_Z;
    this.tabArray["CONTEXTMENU"] = InputManager.keyEventEnum.DOM_VK_CONTEXT_MENU;
    this.tabArray["NUMPAD0"] = InputManager.keyEventEnum.DOM_VK_NUMPAD0;
    this.tabArray["NUMPAD1"] = InputManager.keyEventEnum.DOM_VK_NUMPAD1;
    this.tabArray["NUMPAD2"] = InputManager.keyEventEnum.DOM_VK_NUMPAD2;
    this.tabArray["NUMPAD3"] = InputManager.keyEventEnum.DOM_VK_NUMPAD3;
    this.tabArray["NUMPAD4"] = InputManager.keyEventEnum.DOM_VK_NUMPAD4;
    this.tabArray["NUMPAD5"] = InputManager.keyEventEnum.DOM_VK_NUMPAD5;
    this.tabArray["NUMPAD6"] = InputManager.keyEventEnum.DOM_VK_NUMPAD6;
    this.tabArray["NUMPAD7"] = InputManager.keyEventEnum.DOM_VK_NUMPAD7;
    this.tabArray["NUMPAD8"] = InputManager.keyEventEnum.DOM_VK_NUMPAD8;
    this.tabArray["NUMPAD9"] = InputManager.keyEventEnum.DOM_VK_NUMPAD9;
    this.tabArray["MULTIPLY"] = InputManager.keyEventEnum.DOM_VK_MULTIPLY;
    this.tabArray["ADD"] = InputManager.keyEventEnum.DOM_VK_ADD;
    this.tabArray["SEPARATOR"] = InputManager.keyEventEnum.DOM_VK_SEPARATOR;
    this.tabArray["SUBSTRACT"] = InputManager.keyEventEnum.DOM_VK_SUBTRACT;
    this.tabArray["DECIMAL"] = InputManager.keyEventEnum.DOM_VK_DECIMAL;
    this.tabArray["DIVIDE"] = InputManager.keyEventEnum.DOM_VK_DIVIDE;
    this.tabArray["F1"] = InputManager.keyEventEnum.DOM_VK_F1;
    this.tabArray["F2"] = InputManager.keyEventEnum.DOM_VK_F2;
    this.tabArray["F3"] = InputManager.keyEventEnum.DOM_VK_F3;
    this.tabArray["F4"] = InputManager.keyEventEnum.DOM_VK_F4;
    this.tabArray["F5"] = InputManager.keyEventEnum.DOM_VK_F5;
    this.tabArray["F6"] = InputManager.keyEventEnum.DOM_VK_F6;
    this.tabArray["F7"] = InputManager.keyEventEnum.DOM_VK_F7;
    this.tabArray["F8"] = InputManager.keyEventEnum.DOM_VK_F8;
    this.tabArray["F9"] = InputManager.keyEventEnum.DOM_VK_F9;
    this.tabArray["F10"] = InputManager.keyEventEnum.DOM_VK_F10;
    this.tabArray["F11"] = InputManager.keyEventEnum.DOM_VK_F11;
    this.tabArray["F12"] = InputManager.keyEventEnum.DOM_VK_F12;
    this.tabArray["F13"] = InputManager.keyEventEnum.DOM_VK_F13;
    this.tabArray["F14"] = InputManager.keyEventEnum.DOM_VK_F14;
    this.tabArray["F15"] = InputManager.keyEventEnum.DOM_VK_F15;
    this.tabArray["F16"] = InputManager.keyEventEnum.DOM_VK_F16;
    this.tabArray["F17"] = InputManager.keyEventEnum.DOM_VK_F17;
    this.tabArray["F18"] = InputManager.keyEventEnum.DOM_VK_F18;
    this.tabArray["F19"] = InputManager.keyEventEnum.DOM_VK_F19;
    this.tabArray["F20"] = InputManager.keyEventEnum.DOM_VK_F20;
    this.tabArray["F21"] = InputManager.keyEventEnum.DOM_VK_F21;
    this.tabArray["F22"] = InputManager.keyEventEnum.DOM_VK_F22;
    this.tabArray["F23"] = InputManager.keyEventEnum.DOM_VK_F23;
    this.tabArray["F24"] = InputManager.keyEventEnum.DOM_VK_F24;
    this.tabArray["NUMLOCK"] = InputManager.keyEventEnum.DOM_VK_NUM_LOCK;
    this.tabArray["SCROLLLOCK"] = InputManager.keyEventEnum.DOM_VK_SCROLL_LOCK;
    this.tabArray["COMMA"] = InputManager.keyEventEnum.DOM_VK_COMMA;
    this.tabArray["PERIOD"] = InputManager.keyEventEnum.DOM_VK_PERIOD;
    this.tabArray["SLASH"] = InputManager.keyEventEnum.DOM_VK_SLASH;
    this.tabArray["BACKQUOTE"] = InputManager.keyEventEnum.DOM_VK_BACK_QUOTE;
    this.tabArray["OPENBRACKET"] = InputManager.keyEventEnum.DOM_VK_OPEN_BRACKET;
    this.tabArray["BACKSLASH"] = InputManager.keyEventEnum.DOM_VK_BACK_SLASH;
    this.tabArray["CLOSEBRACKET"] = InputManager.keyEventEnum.DOM_VK_CLOSE_BRACKET;
    this.tabArray["QUOTE"] = InputManager.keyEventEnum.DOM_VK_QUOTE;
    this.tabArray["META"] = InputManager.keyEventEnum.DOM_VK_META;

    document.addEventListener('keyup', this.KeyUp, false);
    document.addEventListener('keydown', this.KeyDown, false);
    document.addEventListener('mousedown', this.MouseDown, false);
    document.addEventListener("mouseup", this.MouseUp, false)
};

InputManager.keyEventEnum = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };

InputManager.prototype.keyUp = function(event){
    keyStatus[event.keyCode] = false;
};

InputManager.prototype.keyDown = function(event){
    keyStatus[event.keyCode] = true;
};

InputManager.prototype.mouseUp = function(event){
    if (event.button & 1)
    {
        this.mouseButton = "LeftButton";
    }
    if (event.button & 2)
    {
        this.mouseButton = "RightButton";
    }
    if (event.button & 4)
    {
        this.mouseButton = "MiddleButton";
    }
};

InputManager.prototype.mouseDown = function(event){
    mouseButton += event.button;
};

InputManager.prototype.bindKeyUp = function(KeyCode, callback){
    if (InputManager.keyEventEnum[this.tabArray[KeyCode]] == true)
    {
        if (callback)
        callback();
    }
};

InputManager.prototype.bindKeyDown = function(KeyCode){
    InputManager.keyEventEnum[this.tabArray[KeyCode]] = false;
};

InputManager.prototype.bindMouseUp = function(Button, callback){
    if (Button == this.mouseButton)
    {
        callback();
    }
};

InputManager.prototype.bindMouseDown = function(Button){
    mouseButton -= event.button;
};