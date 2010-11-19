if (gIncludedFiles == undefined)
 alert("You must include this file");

gIncludedFiles.push("InputManager.js");

/**
 * Input Class
 */

InputManager = function(){
    this.root = Root.getInstance();
        
    //TODO : root.registerNewModule();
    this.root.inputManager = this;
    
    this.keyStatus = [];
    this.mouseButtonStatus = [];
    this.isDragging = false;
    this.mousePos = {
      x : undefined,
      y : undefined,
    }

    document.addEventListener('keyup', this.keyUp, false);
    document.addEventListener('keydown', this.keyDown, false);
    document.addEventListener('mousedown', this.mouseDown, false);
    document.addEventListener("mouseup", this.mouseUp, false);
    document.addEventListener("mousemove", this.mouseMove, false);
    
    this.keyBinds = [];
    this.mouseBinds = [];
  
    this.root.addCallbackToCallbackArray("INPUT_MANAGER_UPDATE", this.update, Root.HookEnum.ROOT_HOOK_ONRENDEREND);

    this.buttonToString = [];
    this.buttonToString[InputManager.mouseEventEnum.MOUSE_BUTTON_LEFT] = "MOUSE_LEFT";
    this.buttonToString[InputManager.mouseEventEnum.MOUSE_BUTTON_MIDDLE] = "MOUSE_MIDDLE";
    this.buttonToString[InputManager.mouseEventEnum.MOUSE_BUTTON_RIGHT] = "MOUSE_RIGHT";
    
    this.stringToButton = [];
    this.stringToButton["MOUSE_LEFT"] = InputManager.mouseEventEnum.MOUSE_BUTTON_LEFT;
    this.stringToButton["MOUSE_MIDDLE"] = InputManager.mouseEventEnum.MOUSE_BUTTON_MIDDLE;
    this.stringToButton["MOUSE_RIGHT"] = InputManager.mouseEventEnum.MOUSE_BUTTON_RIGHT;

    this.codeToString = [];
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CANCEL] = "CANCEL";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_HELP] = "HELP";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_BACK_SPACE] = "BACKSPACE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_TAB] = "TAB";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CLEAR] = "CLEAR";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_RETURN] = "RETURN";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_ENTER] = "ENTER";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SHIFT] = "SHIFT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CONTROL] = "CONTROL";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_ALT] = "ALT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_PAUSE] = "PAUSE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CAPS_LOCK] = "CAPSLOCK";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_ESCAPE] = "ESCAPE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SPACE] = "SPACE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_PAGE_UP] = "PAGEUP";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_PAGE_DOWN] = "PAGEDOWN";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_HOME] = "HOME";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_LEFT] = "LEFT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_UP] = "UP";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_RIGHT] = "RIGHT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_DOWN] = "DOWN";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_PRINTSCREEN] = "PRINTSCREEN";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_INSERT] = "INSERT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_DELETE] = "DELETE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_0] = "0";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_1] = "1";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_2] = "2";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_3] = "3";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_4] = "4";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_5] = "5";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_6] = "6";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_7] = "7";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_8] = "8";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_9] = "9";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SEMICOLON] = "SEMICOLON";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_EQUALS] = "EQUALS";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_A] = "A";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_B] = "B";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_C] = "C";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_D] = "D";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_E] = "E";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F] = "F";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_G] = "G";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_H] = "H";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_I] = "I";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_J] = "J";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_K] = "K";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_L] = "L";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_M] = "M";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_N] = "N";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_O] = "O";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_P] = "P";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_Q] = "Q";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_R] = "R";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_S] = "S";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_T] = "T";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_U] = "U";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_V] = "V";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_W] = "W";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_X] = "X";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_Y] = "Y";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_Z] = "Z";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CONTEXT_MENU] = "CONTEXTMENU";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD0] = "NUMPAD0";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD1] = "NUMPAD1";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD2] = "NUMPAD2";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD3] = "NUMPAD3";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD4] = "NUMPAD4";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD5] = "NUMPAD5";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD6] = "NUMPAD6";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD7] = "NUMPAD7";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD8] = "NUMPAD8";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUMPAD9] = "NUMPAD9";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_MULTIPLY] = "MULTIPLY";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_ADD] = "ADD";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SEPARATOR] = "SEPARATOR";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SUBTRACT] = "SUBSTRACT";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_DECIMAL] = "DECIMAL";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_DIVIDE] = "DIVIDE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F1] = "F1";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F2] = "F2";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F3] = "F3";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F4] = "F4";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F5] = "F5";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F6] = "F6";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F7] = "F7";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F8] = "F8";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F9] = "F9";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F10] = "F10";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F11] = "F11";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F12] = "F12";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F13] = "F13";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F14] = "F14";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F15] = "F15";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F16] = "F16";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F17] = "F17";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F18] = "F18";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F19] = "F19";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F20] = "F20";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F21] = "F21";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F22] = "F22";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F23] = "F23";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_F24] = "F24";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_NUM_LOCK] = "NUMLOCK";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SCROLL_LOCK] = "SCROLLLOCK";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_COMMA] = "COMMA";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_PERIOD] = "PERIOD";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_SLASH] = "SLASH";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_BACK_QUOTE] = "BACKQUOTE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_OPEN_BRACKET] = "OPENBRACKET";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_BACK_SLASH] = "BACKSLASH";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_CLOSE_BRACKET] = "CLOSEBRACKET";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_QUOTE] = "QUOTE";
    this.codeToString[InputManager.keyEventEnum.DOM_VK_META] = "META";

    this.stringToCode = [];
    this.stringToCode["CANCEL"] = InputManager.keyEventEnum.DOM_VK_CANCEL;
    this.stringToCode["HELP"] = InputManager.keyEventEnum.DOM_VK_HELP;
    this.stringToCode["BACKSPACE"] = InputManager.keyEventEnum.DOM_VK_BACK_SPACE;
    this.stringToCode["TAB"] = InputManager.keyEventEnum.DOM_VK_TAB;
    this.stringToCode["CLEAR"] = InputManager.keyEventEnum.DOM_VK_CLEAR;
    this.stringToCode["RETURN"] = InputManager.keyEventEnum.DOM_VK_RETURN;
    this.stringToCode["ENTER"] = InputManager.keyEventEnum.DOM_VK_ENTER;
    this.stringToCode["SHIFT"] = InputManager.keyEventEnum.DOM_VK_SHIFT;
    this.stringToCode["CONTROL"] = InputManager.keyEventEnum.DOM_VK_CONTROL;
    this.stringToCode["ALT"] = InputManager.keyEventEnum.DOM_VK_ALT;
    this.stringToCode["PAUSE"] = InputManager.keyEventEnum.DOM_VK_PAUSE;
    this.stringToCode["CAPSLOCK"] = InputManager.keyEventEnum.DOM_VK_CAPS_LOCK;
    this.stringToCode["ESCAPE"] = InputManager.keyEventEnum.DOM_VK_ESCAPE;
    this.stringToCode["SPACE"] = InputManager.keyEventEnum.DOM_VK_SPACE;
    this.stringToCode["PAGEUP"] = InputManager.keyEventEnum.DOM_VK_PAGE_UP;
    this.stringToCode["PAGEDOWN"] = InputManager.keyEventEnum.DOM_VK_PAGE_DOWN;
    this.stringToCode["END"] = InputManager.keyEventEnum.DOM_VK_END;
    this.stringToCode["HOME"] = InputManager.keyEventEnum.DOM_VK_HOME;
    this.stringToCode["LEFT"] = InputManager.keyEventEnum.DOM_VK_LEFT;
    this.stringToCode["UP"] = InputManager.keyEventEnum.DOM_VK_UP;
    this.stringToCode["RIGHT"] = InputManager.keyEventEnum.DOM_VK_RIGHT;
    this.stringToCode["DONW"] = InputManager.keyEventEnum.DOM_VK_DOWN;
    this.stringToCode["PRINTSCREEN"] = InputManager.keyEventEnum.DOM_VK_PRINTSCREEN;
    this.stringToCode["INSERT"] = InputManager.keyEventEnum.DOM_VK_INSERT;
    this.stringToCode["DELETE"] = InputManager.keyEventEnum.DOM_VK_DELETE;
    this.stringToCode["0"] = InputManager.keyEventEnum.DOM_VK_0;
    this.stringToCode["1"] = InputManager.keyEventEnum.DOM_VK_1;
    this.stringToCode["2"] = InputManager.keyEventEnum.DOM_VK_2;
    this.stringToCode["3"] = InputManager.keyEventEnum.DOM_VK_3;
    this.stringToCode["4"] = InputManager.keyEventEnum.DOM_VK_4;
    this.stringToCode["5"] = InputManager.keyEventEnum.DOM_VK_5;
    this.stringToCode["6"] = InputManager.keyEventEnum.DOM_VK_6;
    this.stringToCode["7"] = InputManager.keyEventEnum.DOM_VK_7;
    this.stringToCode["8"] = InputManager.keyEventEnum.DOM_VK_8;
    this.stringToCode["9"] = InputManager.keyEventEnum.DOM_VK_9;
    this.stringToCode["SEMICOLON"] = InputManager.keyEventEnum.DOM_VK_SEMICOLON;
    this.stringToCode["EQUAL"] = InputManager.keyEventEnum.DOM_VK_EQUALS;
    this.stringToCode["A"] = InputManager.keyEventEnum.DOM_VK_A;
    this.stringToCode["B"] = InputManager.keyEventEnum.DOM_VK_B;
    this.stringToCode["C"] = InputManager.keyEventEnum.DOM_VK_C;
    this.stringToCode["D"] = InputManager.keyEventEnum.DOM_VK_D;
    this.stringToCode["E"] = InputManager.keyEventEnum.DOM_VK_E;
    this.stringToCode["F"] = InputManager.keyEventEnum.DOM_VK_F;
    this.stringToCode["G"] = InputManager.keyEventEnum.DOM_VK_G;
    this.stringToCode["H"] = InputManager.keyEventEnum.DOM_VK_H;
    this.stringToCode["I"] = InputManager.keyEventEnum.DOM_VK_I;
    this.stringToCode["J"] = InputManager.keyEventEnum.DOM_VK_J;
    this.stringToCode["K"] = InputManager.keyEventEnum.DOM_VK_K;
    this.stringToCode["L"] = InputManager.keyEventEnum.DOM_VK_L;
    this.stringToCode["M"] = InputManager.keyEventEnum.DOM_VK_M;
    this.stringToCode["N"] = InputManager.keyEventEnum.DOM_VK_N;
    this.stringToCode["O"] = InputManager.keyEventEnum.DOM_VK_O;
    this.stringToCode["P"] = InputManager.keyEventEnum.DOM_VK_P;
    this.stringToCode["Q"] = InputManager.keyEventEnum.DOM_VK_Q;
    this.stringToCode["R"] = InputManager.keyEventEnum.DOM_VK_R;
    this.stringToCode["S"] = InputManager.keyEventEnum.DOM_VK_S;
    this.stringToCode["T"] = InputManager.keyEventEnum.DOM_VK_T;
    this.stringToCode["U"] = InputManager.keyEventEnum.DOM_VK_U;
    this.stringToCode["V"] = InputManager.keyEventEnum.DOM_VK_V;
    this.stringToCode["W"] = InputManager.keyEventEnum.DOM_VK_W;
    this.stringToCode["X"] = InputManager.keyEventEnum.DOM_VK_X;
    this.stringToCode["Y"] = InputManager.keyEventEnum.DOM_VK_Y;
    this.stringToCode["Z"] = InputManager.keyEventEnum.DOM_VK_Z;
    this.stringToCode["CONTEXTMENU"] = InputManager.keyEventEnum.DOM_VK_CONTEXT_MENU;
    this.stringToCode["NUMPAD0"] = InputManager.keyEventEnum.DOM_VK_NUMPAD0;
    this.stringToCode["NUMPAD1"] = InputManager.keyEventEnum.DOM_VK_NUMPAD1;
    this.stringToCode["NUMPAD2"] = InputManager.keyEventEnum.DOM_VK_NUMPAD2;
    this.stringToCode["NUMPAD3"] = InputManager.keyEventEnum.DOM_VK_NUMPAD3;
    this.stringToCode["NUMPAD4"] = InputManager.keyEventEnum.DOM_VK_NUMPAD4;
    this.stringToCode["NUMPAD5"] = InputManager.keyEventEnum.DOM_VK_NUMPAD5;
    this.stringToCode["NUMPAD6"] = InputManager.keyEventEnum.DOM_VK_NUMPAD6;
    this.stringToCode["NUMPAD7"] = InputManager.keyEventEnum.DOM_VK_NUMPAD7;
    this.stringToCode["NUMPAD8"] = InputManager.keyEventEnum.DOM_VK_NUMPAD8;
    this.stringToCode["NUMPAD9"] = InputManager.keyEventEnum.DOM_VK_NUMPAD9;
    this.stringToCode["MULTIPLY"] = InputManager.keyEventEnum.DOM_VK_MULTIPLY;
    this.stringToCode["ADD"] = InputManager.keyEventEnum.DOM_VK_ADD;
    this.stringToCode["SEPARATOR"] = InputManager.keyEventEnum.DOM_VK_SEPARATOR;
    this.stringToCode["SUBSTRACT"] = InputManager.keyEventEnum.DOM_VK_SUBTRACT;
    this.stringToCode["DECIMAL"] = InputManager.keyEventEnum.DOM_VK_DECIMAL;
    this.stringToCode["DIVIDE"] = InputManager.keyEventEnum.DOM_VK_DIVIDE;
    this.stringToCode["F1"] = InputManager.keyEventEnum.DOM_VK_F1;
    this.stringToCode["F2"] = InputManager.keyEventEnum.DOM_VK_F2;
    this.stringToCode["F3"] = InputManager.keyEventEnum.DOM_VK_F3;
    this.stringToCode["F4"] = InputManager.keyEventEnum.DOM_VK_F4;
    this.stringToCode["F5"] = InputManager.keyEventEnum.DOM_VK_F5;
    this.stringToCode["F6"] = InputManager.keyEventEnum.DOM_VK_F6;
    this.stringToCode["F7"] = InputManager.keyEventEnum.DOM_VK_F7;
    this.stringToCode["F8"] = InputManager.keyEventEnum.DOM_VK_F8;
    this.stringToCode["F9"] = InputManager.keyEventEnum.DOM_VK_F9;
    this.stringToCode["F10"] = InputManager.keyEventEnum.DOM_VK_F10;
    this.stringToCode["F11"] = InputManager.keyEventEnum.DOM_VK_F11;
    this.stringToCode["F12"] = InputManager.keyEventEnum.DOM_VK_F12;
    this.stringToCode["F13"] = InputManager.keyEventEnum.DOM_VK_F13;
    this.stringToCode["F14"] = InputManager.keyEventEnum.DOM_VK_F14;
    this.stringToCode["F15"] = InputManager.keyEventEnum.DOM_VK_F15;
    this.stringToCode["F16"] = InputManager.keyEventEnum.DOM_VK_F16;
    this.stringToCode["F17"] = InputManager.keyEventEnum.DOM_VK_F17;
    this.stringToCode["F18"] = InputManager.keyEventEnum.DOM_VK_F18;
    this.stringToCode["F19"] = InputManager.keyEventEnum.DOM_VK_F19;
    this.stringToCode["F20"] = InputManager.keyEventEnum.DOM_VK_F20;
    this.stringToCode["F21"] = InputManager.keyEventEnum.DOM_VK_F21;
    this.stringToCode["F22"] = InputManager.keyEventEnum.DOM_VK_F22;
    this.stringToCode["F23"] = InputManager.keyEventEnum.DOM_VK_F23;
    this.stringToCode["F24"] = InputManager.keyEventEnum.DOM_VK_F24;
    this.stringToCode["NUMLOCK"] = InputManager.keyEventEnum.DOM_VK_NUM_LOCK;
    this.stringToCode["SCROLLLOCK"] = InputManager.keyEventEnum.DOM_VK_SCROLL_LOCK;
    this.stringToCode["COMMA"] = InputManager.keyEventEnum.DOM_VK_COMMA;
    this.stringToCode["PERIOD"] = InputManager.keyEventEnum.DOM_VK_PERIOD;
    this.stringToCode["SLASH"] = InputManager.keyEventEnum.DOM_VK_SLASH;
    this.stringToCode["BACKQUOTE"] = InputManager.keyEventEnum.DOM_VK_BACK_QUOTE;
    this.stringToCode["OPENBRACKET"] = InputManager.keyEventEnum.DOM_VK_OPEN_BRACKET;
    this.stringToCode["BACKSLASH"] = InputManager.keyEventEnum.DOM_VK_BACK_SLASH;
    this.stringToCode["CLOSEBRACKET"] = InputManager.keyEventEnum.DOM_VK_CLOSE_BRACKET;
    this.stringToCode["QUOTE"] = InputManager.keyEventEnum.DOM_VK_QUOTE;
    this.stringToCode["META"] = InputManager.keyEventEnum.DOM_VK_META;
};

InputManager.mouseEventEnum = {
        MOUSE_BUTTON_LEFT: 0,
        MOUSE_BUTTON_MIDDLE:1,
        MOUSE_BUTTON_RIGHT:2
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
    Root.getInstance().inputManager.keyStatus[event.keyCode] = false;
};

InputManager.prototype.keyDown = function(event){
    Root.getInstance().inputManager.keyStatus[event.keyCode] = true;
};

InputManager.prototype.mouseUp = function(event){
    var input = Root.getInstance().inputManager;
    input.mouseButtonStatus[event.button] = false;
    input.isDragging = false;
};

InputManager.prototype.mouseDown = function(event){
    var input = Root.getInstance().inputManager;
    input.mouseButtonStatus[event.button] = true;
    input.isDragging = true;
};


//TODO: provide more X/Y values (page, client...)
InputManager.prototype.mouseMove = function(event) {
    var input = Root.getInstance().inputManager;
    input.mousePos.x = event.screenX;
    input.mousePos.y = event.screenY;
};

InputManager.prototype.bindKey = function(keyString, callback){
    var bind = {};
    bind.callback = callback;
    bind.keyCode = this.stringToCode[keyString];
    
    this.keyBinds.push(bind);
};

InputManager.prototype.bindMouse = function(buttonString, callback){
    var bind = {};
    bind.callback = callback;
    bind.mouseButton = this.stringToButton[buttonString];
    
    this.mouseBinds.push(bind);
};

// This function is added to the root onRenderEnd Callback
InputManager.prototype.update = function(elapsedTime){
    var input = Root.getInstance().inputManager;
    
    for (var i = 0; i < input.keyBinds.length; ++i) {
      if (input.keyStatus[input.keyBinds[i].keyCode] == true) {
        input.keyBinds[i].callback(elapsedTime);
      }
    }
    
    for (var i = 0; i < input.mouseBinds.length; ++i) {
      if (input.mouseButtonStatus[input.mouseBinds[i].mouseButton] == true) {
        input.mouseBinds[i].callback(elapsedTime);
      }
    }
};
