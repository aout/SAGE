if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("InputManager.js");
include("sage3d.js");
include("transform.js");


/**
 * Input Class
 */
/*
function InputManager
{  
    var keyStatus = {};
    var mouseButton = "";
    var tElapsed = "";
    var constant_move = 1.5;
    var constant_rot = 90;
    var transform = Transform.getTransform("freeCam");
    var move = constant_move * (elapsed / 1000.0);
    var rot = constant_rot * (elapsed / 1000.0);
    
    if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
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
}

var tabArray[];
tabArray["CANCEL"]      =         DOM_VK_CANCEL;
tabArray["HELP"]        =         DOM_VK_HELP;
tabArray["BACKSPACE"]   =         DOM_VK_BACK_SPACE;
tabArray["TAB"]         =         DOM_VK_TAB;
tabArray["CLEAR"]       =         DOM_VK_CLEAR;
tabArray["RETURN"]      =         DOM_VK_RETURN;
tabArray["ENTER"]       =         DOM_VK_ENTER;
tabArray["SHIFT"]       =         DOM_VK_SHIFT;
tabArray["CONTROL"]     =         DOM_VK_CONTROL;
tabArray["ALT"]         =         DOM_VK_ALT;
tabArray["PAUSE"]       =         DOM_VK_PAUSE;
tabArray["CAPSLOCK"]    =         DOM_VK_CAPS_LOCK;
tabArray["ESCAPE"]      =         DOM_VK_ESCAPE;
tabArray["SPACE"]       =         DOM_VK_SPACE;
tabArray["PAGEUP"]      =         DOM_VK_PAGE_UP;
tabArray["PAGEDOWN"]    =         DOM_VK_PAGE_DOWN;
tabArray["END"]         =         DOM_VK_END;
tabArray["HOME"]        =         DOM_VK_HOME;
tabArray["LEFT"]        =         DOM_VK_LEFT;
tabArray["UP"]          =         DOM_VK_UP;
tabArray["RIGHT"]       =         DOM_VK_RIGHT;
tabArray["DONW"]        =         DOM_VK_DOWN;
tabArray["PRINTSCREEN"] =         DOM_VK_PRINTSCREEN;
tabArray["INSERT"]      =         DOM_VK_INSERT;
tabArray["DELETE"]      =         DOM_VK_DELETE;
tabArray["0"]           =         DOM_VK_0;
tabArray["1"]           =         DOM_VK_1;
tabArray["2"]           =         DOM_VK_2;
tabArray["3"]           =         DOM_VK_3;
tabArray["4"]           =         DOM_VK_4;
tabArray["5"]           =         DOM_VK_5;
tabArray["6"]           =         DOM_VK_6;
tabArray["7"]           =         DOM_VK_7;
tabArray["8"]           =         DOM_VK_8;
tabArray["9"]           =         DOM_VK_9;
tabArray["SEMICOLON"]   =         DOM_VK_SEMICOLON;
tabArray["EQUAL"]       =         DOM_VK_EQUALS;
tabArray["A"]           =         DOM_VK_A;
tabArray["B"]           =         DOM_VK_B;
tabArray["C"]           =         DOM_VK_C;
tabArray["D"]           =         DOM_VK_D;
tabArray["E"]           =         DOM_VK_E;
tabArray["F"]           =         DOM_VK_F;
tabArray["G"]           =         DOM_VK_G;
tabArray["H"]           =         DOM_VK_H;
tabArray["I"]           =         DOM_VK_I;
tabArray["J"]           =         DOM_VK_J;
tabArray["K"]           =         DOM_VK_K;
tabArray["L"]           =         DOM_VK_L;
tabArray["M"]           =         DOM_VK_M;
tabArray["N"]           =         DOM_VK_N;
tabArray["O"]           =         DOM_VK_O;
tabArray["P"]           =         DOM_VK_P;
tabArray["Q"]           =         DOM_VK_Q;
tabArray["R"]           =         DOM_VK_R;
tabArray["S"]           =         DOM_VK_S;
tabArray["T"]           =         DOM_VK_T;
tabArray["U"]           =         DOM_VK_U;
tabArray["V"]           =         DOM_VK_V;
tabArray["W"]           =         DOM_VK_W;
tabArray["X"]           =         DOM_VK_X;
tabArray["Y"]           =         DOM_VK_Y;
tabArray["Z"]           =         DOM_VK_Z;
tabArray["CONTEXTMENU"] =         DOM_VK_CONTEXT_MENU;
tabArray["NUMPAD0"]     =         DOM_VK_NUMPAD0;
tabArray["NUMPAD1"]     =         DOM_VK_NUMPAD1;
tabArray["NUMPAD2"]     =         DOM_VK_NUMPAD2;
tabArray["NUMPAD3"]     =         DOM_VK_NUMPAD3;
tabArray["NUMPAD4"]     =         DOM_VK_NUMPAD4;
tabArray["NUMPAD5"]     =         DOM_VK_NUMPAD5;
tabArray["NUMPAD6"]     =         DOM_VK_NUMPAD6;
tabArray["NUMPAD7"]     =         DOM_VK_NUMPAD7;
tabArray["NUMPAD8"]     =         DOM_VK_NUMPAD8;
tabArray["NUMPAD9"]     =         DOM_VK_NUMPAD9;
tabArray["MULTIPLY"]    =         DOM_VK_MULTIPLY;
tabArray["ADD"]         =         DOM_VK_ADD;
tabArray["SEPARATOR"]   =         DOM_VK_SEPARATOR;
tabArray["SUBSTRACT"]   =         DOM_VK_SUBTRACT;
tabArray["DECIMAL"]     =         DOM_VK_DECIMAL;
tabArray["DIVIDE"]      =         DOM_VK_DIVIDE;
tabArray["F1"]          =         DOM_VK_F1;
tabArray["F2"]          =         DOM_VK_F2;
tabArray["F3"]          =         DOM_VK_F3;
tabArray["F4"]          =         DOM_VK_F4;
tabArray["F5"]          =         DOM_VK_F5;
tabArray["F6"]          =         DOM_VK_F6;
tabArray["F7"]          =         DOM_VK_F7;
tabArray["F8"]          =         DOM_VK_F8;
tabArray["F9"]          =         DOM_VK_F9;
tabArray["F10"]         =         DOM_VK_F10;
tabArray["F11"]         =         DOM_VK_F11;
tabArray["F12"]         =         DOM_VK_F12;
tabArray["F13"]         =         DOM_VK_F13;
tabArray["F14"]         =         DOM_VK_F14;
tabArray["F15"]         =         DOM_VK_F15;
tabArray["F16"]         =         DOM_VK_F16;
tabArray["F17"]         =         DOM_VK_F17;
tabArray["F18"]         =         DOM_VK_F18;
tabArray["F19"]         =         DOM_VK_F19;
tabArray["F20"]         =         DOM_VK_F20;
tabArray["F21"]         =         DOM_VK_F21;
tabArray["F22"]         =         DOM_VK_F22;
tabArray["F23"]         =         DOM_VK_F23;
tabArray["F24"]         =         DOM_VK_F24;
tabArray["NUMLOCK"]     =         DOM_VK_NUM_LOCK;
tabArray["SCROLLLOCK"]  =         DOM_VK_SCROLL_LOCK;
tabArray["COMMA"]       =         DOM_VK_COMMA;
tabArray["PERIOD"]      =         DOM_VK_PERIOD;
tabArray["SLASH"]       =         DOM_VK_SLASH;
tabArray["BACKQUOTE"]   =         DOM_VK_BACK_QUOTE;
tabArray["OPENBRACKET"] =         DOM_VK_OPEN_BRACKET;
tabArray["BACKSLASH"]   =         DOM_VK_BACK_SLASH;
tabArray["CLOSEBRACKET"]=         DOM_VK_CLOSE_BRACKET;
tabArray["QUOTE"]       =         DOM_VK_QUOTE;
tabArray["META"]        =         DOM_VK_META;
    
    document.addEventListener('keyup',KeyUp,false);
    document.addEventListener('keydown',KeyDown,false);
    document.addEventListener('mousedown', MouseDown, false);
    document.addEventListener("mouseup", MouseUp, false)
    
   this.getElapsed(elapsedTime);
   {
     elapsed = elapsedTime;
   }
   this.keyUp = function(event) 
   {
     keyStatus[event.keyCode] = false;
   }
   this.keyDown = function(event) 
   {
     keyStatus[event.keyCode] = true;
   }
   this.ListenKeyUp = function(KeyCode, function())  
   {  
      if (keyStatus[tabArray[KeyCode]] == true)
      {
        function();
      }
   }
   this.ListenKeyDown = function(KeyCode)
   {
      keyStatus[tabArray[KeyCode]] = false;
   }
   this.mouseUp = function(event)
   {
        if (event.button & 1)
          {
             mouseButton = "LeftButton";
          }
        if (event.button & 2)
          {
             mouseButton = "RightButton";
          }
         if (event.button & 4)
          {
             mouseButton = "MiddleButton";
          }    
   }
   this.mouseDown = function(event)
   {
     mouseButton = "";
   }
   this.ListenMouseUp = function(Button, callback)
   {
      if (Button == mouseButton)
      {
        callback();
      }
   }
   this.ListenMouseDown = function(Button)
   {
    mouseButton = ""; 
   }
   
}

InputManager.prototype.Z = function()
{
  transform.translate([0.0, 0.0, -move]);
}

InputManager.prototype.S = function()
{
  transform.translate([0.0, 0.0, move]);
}

InputManager.prototype.Q = function()
{
  transform.rotate(rot, [0.0, 1.0, 0.0]);
}

InputManager.prototype.D = function()
{
  transform.rotate(-rot, [0.0, 1.0, 0.0]);
}

InputManager.prototype.UP = function()
{
  transform.rotate(rot, [1.0, 0.0, 0.0]);
}

InputManager.prototype.DOWN = function()
{
  transform.rotate(-rot, [1.0, 0.0, 0.0]);
}

InputManager.prototype.LEFT = function()
{
  transform.rotate(rot, [0.0, 0.0, 1.0]);
}
InputManager.prototype.RIGHT = function()
{
  transform.rotate(-rot, [0.0, 0.0, 1.0]);
}
*/