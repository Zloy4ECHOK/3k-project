/*
Fretboard drawing 
*/

var fretboardModeToken = 'mode-fretboard';
var fretboardCanvasId = 'fretboard-canvas';

var fretboardSettings = {
    /* TODO : settings and state for fretboard here */
    fingerPositions: [],
    noteNames: [],
    chordName: "Chord",
    stringState:new Array(6).fill("open"),
    widthToHeightRatio: 0.64,
};

/**
 * Create fretboard-related HTML controls
 */

window.addEventListener('load', function () {
    var lastchild = document.querySelector("#mode-keyboard-controls");

    var element = document.createElement('template');

    //Insert switch

    lastchild.insertAdjacentHTML('afterend', "<div class='mode-dependent' id='" + fretboardModeToken + "-controls'>" +
        "<label class='switch'>" +
        "<input type='checkbox' id='fretboard-show' onchange='setFretboardVisibility(this)'>" +
        "<span class='slider'>Показать</span></label></div>");

    lastchild.insertAdjacentHTML('afterend', "<label class='switch'>" +
        "<input type='checkbox' id='" + fretboardModeToken + "' onchange='changemode(this)'>" +
        "<span class='slider'>ГИТАРНЫЙ ГРИФ</span></label>");

    //Insert canvas

    document.querySelector("#keyboard").insertAdjacentHTML('afterend', '<div id="fretboard" class="canvas-container" style="display:none">' +
        '<canvas id="' + fretboardCanvasId + '" height="500"></canvas></div>');

    avaliableContainerIds.push('fretboard');   //container id actually

    //Register handlers for freboard mode
    availableModeFunctions[fretboardCanvasId] =
        {
            'mode-basetone': function (x, y, canvas, evtype) { /*nothing*/ },
            'mode-alttone': function (x, y, canvas, evtype) {  /*nothing*/ },
            'mode-chords': toggleFretHighlight,
            'mode-arrows': function (x, y, canvas, evtype) { /*nothing*/ },
            'mode-labels': toggleFretLabel,
            'mode-fill': function (x, y, canvas, evtype) { /*nothing*/ },
            'mode-highlight': function (x, y, canvas, evtype) { /*nothing*/ },
            'mode-keyboard': function (x, y, canvas, evtype) {  /*nothing*/ },
            'mode-fretboard': function (x, y, canvas, evtype, code) { toggleFretHighlight(x, y, canvas, evtype, code) },
        };

    fretboard = addModeListeners(document.getElementById(fretboardCanvasId));

    document.getElementById('mode-fretboard').addEventListener('change',
        function (event) {

            if (document.getElementById('mode-fretboard').checked) {

                document.getElementById('fretboard-show').checked = true;

                setFretboardVisibility(document.getElementById('fretboard-show'));
            }
            return false;
        }, false);

});

function setFretboardVisibility(source) {

    showCanvasAccordingToMode(source.checked ? 'fretboard' : null);

    if (!source.checked) {
        redraw();
        return;
    }

    fretboardSettings.noteNames = new Array(6).fill("");
    prompt("Буквы нот внизу через пробел(вместо пустых -) слева направо").split(' ').forEach((name, i) => {
        fretboardSettings.noteNames[i] = name == "-" ? " " : name;
    })
    drawFretboard();
}


function drawFretboard() {

    updateFretboardSize();
    drawFretboardBase(fretboard.ctx, fretboard.clientWidth, fretboard.clientHeight);
    drawStringStates(fretboard.ctx, fretboard.clientWidth, fretboard.clientHeight);
    drawFingerPositions(fretboard.ctx, fretboard.clientWidth, fretboard.clientHeight);
    drawNoteNames(fretboard.ctx, fretboard.clientWidth, fretboard.clientHeight);
}

function updateFretboardSize() {
    var height = fretboard.clientHeight;

    /* TODO : adapt to desired ratio */

    document.querySelector("#" + fretboardCanvasId).width = height * fretboardSettings.widthToHeightRatio;
}
function drawStringStates(ctx, w, h) {
    /* TODO : string states menu (open, muted, none)*/
    ctx.fillStyle = 'black';
    ctx.font = Math.round(0.1 * h).toString() + "px Times New Roman";
    ctx.textAlign = 'center';
    for (var i = 0; i < 6; i++) {
        state = translateStringState(fretboardSettings.stringState[i],i);
        ctx.fillText(state, 3 / 16 * w + 2 / 16 * w * i, 0.3 * h);
    }
}
/*TODO: state type*/

/**
 * 
 * @param {string} stateName 
 */
function translateStringState(stateName,string) {    
    switch (stateName) {
        case "muted":
            return "×"
        case "open":
            if (getFinger(string) == null)
                return "○";
        default:
            return "";
    }
}
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {int} w 
 * @param {int} h 
 */
function drawFingerPositions(ctx, w, h) {
    ctx.font = Math.round(0.06 * h) + "px Times New Roman";
    fretboardSettings.fingerPositions.forEach((position) => {
        var x = 13 / 16 * w - 1 / 8 * w * (position.string - 1);
        var y = 0.26 * h + 0.1 * h * position.fret;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x, y, 0.035 * h, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText(position.finger, x, y + 0.02 * h);
    });

    //❶ ❷ ❸ ❹ ❺
}


/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {int} w 
 * @param {int} h 
 */
function drawFretboardBase(ctx, w, h) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'black';
    ctx.font = Math.round(0.15 * h).toString() + "px Times New Roman";
    ctx.textAlign = 'center';
    ctx.fillText(fretboardSettings.chordName, 0.5 * w, 0.2 * h);

    ctx.strokeRect(3 / 16 * w, 0.3 * h, 5 / 8 * w, 0.52 * h);
    ctx.fillRect(3 / 16 * w, 0.3 * h, 5 / 8 * w, 0.02 * h);

    ctx.beginPath();
    for (var i = 1; i < 6; i++) {
        ctx.moveTo(3 / 16 * w + 2 / 16 * w * i, 0.3 * h);
        ctx.lineTo(3 / 16 * w + 2 / 16 * w * i, 0.82 * h);
    }
    for (var i = 1; i < 5; i++) {
        ctx.moveTo(3 / 16 * w, 0.3 * h + 0.104 * h * i);
        ctx.lineTo(13 / 16 * w, 0.3 * h + 0.104 * h * i);
    }
    ctx.stroke();
}
function drawNoteNames(ctx, w, h) {
    updateNoteNames();
    var names = fretboardSettings.noteNames;
    ctx.fillStyle = 'black';
    ctx.font = Math.round(0.06 * h).toString() + "px Times New Roman";
    ctx.textAlign = 'center';
    for (var i = 0; i < 6; i++) {
        ctx.fillText(names[i], 3 / 16 * w + 2 / 16 * w * i, 0.88 * h);
    }
}
function updateNoteNames() {
    var names = ["E", "A", "D", "G", "H", "E"];
    for (var i = 0; i < 6; i++)
        if (fretboardSettings.stringState[i] == "muted")
            names[i] = "";

}
function getFinger(string) {
        fretboardSettings.stringState.forEach(state => {
        if(state.string == string)
            return state.finger;
    });
    return null;
}

function handleFretClick(x, y) {
    var w = fretboard.clientWidth;
    var h = fretboard.clientHeight;
    if (y > 0.3 * h && y < 0.8 * h && x > 0.125 * w && x < 0.875 * w) {
        var finger = prompt("Номер пальца");
        var fret = Math.round((y - 0.352 * h) / (0.104 * h)) + 1;
        var string = 6 - Math.round((7 * x - w) / w);
        fretboardSettings.fingerPositions.push({ string, fret, finger });
    }
}
function handleMuteClick(x, y) {
    var w = fretboard.clientWidth;
    var h = fretboard.clientHeight;
    if (y > 0.2 * h && y < 0.3 * h && x > 0.125 * w && x < 0.875 * w) {
        var string = Math.round((7 * x - w) / w);
        switchStringState(string);
    }
}
function switchStringState(string) {
    var current = fretboardSettings.stringState[string]
    var newState = "";
    switch (current) {
        case "muted":
            newState = "open";
            break;
        default:
            newState = "muted";
            break;
        
    }
    
    fretboardSettings.stringState[string] = newState
}
function handleNameClick(x, y) {
    var h = fretboard.clientHeight;
    if (y > 0.2 * h)
        return;
    fretboardSettings.chordName = prompt("Имя аккорда",fretboardSettings.chordName);

}
function handleFretRemoval(x, y) {
    var w = fretboard.clientWidth;
    var h = fretboard.clientHeight;
    if (y > 0.3 * h && y < 0.8 * h && x > 0.125 * w && x < 0.875 * w) {
        var fret = Math.round((y - 0.352 * h) / (0.104 * h)) + 1;
        var string = 6 - Math.round((7 * x - w) / w);
        var pos = fretboardSettings.fingerPositions.findIndex((pos) => {
            return pos.string == string && pos.fret == fret
        })
        if (pos == -1)
            return;
        fretboardSettings.fingerPositions.splice(pos, 1)
    }
}

function toggleFretHighlight(x, y, cavnas, evtype, code) {
    

    if (evtype != 'mousedown') {
        return;
    }
    switch (code.button) {
        case 0:
            handleFretClick(x, y);
            handleMuteClick(x, y);
            handleNameClick(x, y);
            break;
        default:
            code.preventDefault();
            handleFretRemoval(x, y);
    }
    redraw();
}

function toggleFretLabel(x, y, cavnas, evtype) {
    if (evtype != 'mousedown')
        return;

    /* TODO */
}