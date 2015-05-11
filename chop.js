//Global variables definition (initialized in the function "initialize"):
var bitDiameter;
var safeZ;
var angle;
var boardLength;
var backLength;
var frontLength;
var boardThickness;
var cutHeight;
var cutNumber;
var canvas;
var ctx;
var cutBack = true;

/**
 * Finds the start and end position of the cut. Goes from the front to the back.
 * @return {object} The start position and the end position.
 */
function findCutPath() {
    var path = {start : {}, end : {}};
    // path.start = {};
    // path.end = {};

    if(cutBack)
        calculateFrontLength();
    else
        calculateBackLength();

    path.start.x = parseFloat(frontLength.value);
    path.start.y = 0;
    path.end.x = parseFloat(backLength.value);
    path.end.y = parseFloat(boardLength.value);

    return path;
}

/**
 * Finds the start and end position of the bit.
 * @param {object} cutPath The path of the cut.
 * @return {object} The start position and the end position.
 */
function findBitPath(cutPath) {
    var shift = 0, rise = 0, halfBit = 0;
    var path = {
        start : {x : cutPath.start.x, y : cutPath.start.y},
        end : {x : cutPath.end.x, y : cutPath.end.y}
    };

    if(document.getElementById("cut_pos_right").checked == true) {
        checkFloat(bitDiameter);
        halfBit = (parseFloat(bitDiameter.value)) / 2;

        shift = halfBit * Math.cos(parseFloat(angle.value)*Math.PI/180);
        rise = halfBit * Math.sin(parseFloat(angle.value)*Math.PI/180);
        if(document.getElementById("tilt_right").checked == true) {
            rise *= -1;
        }

        path.start.x += shift;
        path.start.y += rise;  //Must start at 0?
        path.end.x += shift;
        path.end.y += rise;
    }


    return path;
}

/**
 * Generates the GCode.
 * 
 * @return {string} The GCode.
 */
function generateGCode() {
    var gcode = "";

    //check all the input
    checkFloat(bitDiameter);
    checkFloat(safeZ);
    checkFloat(angle);
    checkFloat(boardLength);
    checkFloat(backLength);
    checkFloat(frontLength);
    checkFloat(boardThickness);
    checkFloat(cutHeight);
    checkFloat(cutNumber);

    // var xStart = parseFloat(backLength.value).toFixed(5).toString();
    // var yStart = parseFloat(boardLength.value).toFixed(5).toString();
    // var xEnd = parseFloat(frontLength.value).toFixed(5).toString();
    // var yEnd = "0";
    var bitPath = findBitPath(findCutPath());
    var zEnd = (parseFloat(boardThickness.value)-parseFloat(safeZ.value)).toFixed(5).toString();

    gcode += "(Cutting straight)\n";
    if(document.getElementById("unit_in").checked == true)
        gcode += "G20 (inches)\n";
    else
        gcode += "G21 (millimeters)\n";
    
    //TODO: see if it's good
    gcode += "(Go to the initial position)\n";
    gcode += "G0 X" + bitPath.start.x.toFixed(5) + " Y" + bitPath.start.y.toFixed(5) + "\n";

    gcode += "M3 (Spindle on clock wise)\n";
    gcode += "(Make the cut)\n";
    gcode += "G1 Z" + zEnd + "\n";
    gcode += "G1 X" + bitPath.end.x.toFixed(5) + " Y" + bitPath.end.y.toFixed(5) + "\n";
    gcode += "G1 Z0\n";

    gcode += "M8 (Spindle off)\n"
    gcode += "(Go to the initial position)\n";
    // gcode += "G0 X" + bitPath.start.x.toFixed(5) + " Y" + bitPath.start.y.toFixed(5) + "\n";
    gcode += "G0 X0Y0\n";

    // gCode += "G40 (Tool Radius Compensation: off)\n";
    // gCode += "G49 (Tool Length Offset Compensation: off)\n";
    // gCode += "G54 (Work Coordinate System)\n";
    // gCode += "G80 (Cancel Canned Cycle)\n";
    // gCode += "G90 (Absolute programming)\n";
    // // gCode += "G94 (Feedrate per minute)\n";
    //     gCode += "G0 Z1.0(seek to z = 1)\n"; 
    // // gCode += "F" + feedrate + " (Feedrate - in inches per minute)\n";
    //     gCode += "G00 X" + leftX + " Y" + midY + " Z1.0\n";

    return gcode;
}

/**
 * Checks if an input text element contains a float. Corrects the element.
 *
 * @param {object} element Input text element to check.
 */
function checkFloat(element) {
    if(isNaN(parseFloat(element.value)))
        element.value = 0;
    else
        element.value = parseFloat(element.value);
}


/**
 * Converts inches into millimeters.
 *
 * @param {number} inches The number of inches.
 * @return {number} The number of inches converted in millimeter.
 */
function convertInToMm(inches) {
    return (isNaN(inches)) ? 0.0 : (parseFloat(inches) * 25.4);
}

/**
 * Converts millimeters into inches.
 *
 * @param {number} millimeters The number of millimeters.
 * @return {number} The number of millimeters converted in inch.
 */
function convertMmToIn(millimeters) {
    return (isNaN(millimeters)) ? 0.0 : (parseFloat(millimeters) / 25.4);
}

/**
 * Gets the number of pixel for an inch.
 *
 * @return {number} The number of pixel for an inch.
 */
function inchToPixel() {
    var itp = parseFloat(document.getElementById("in_to_px").value);
    if(isNaN(itp))
        return 0;
    return itp;
}

/**
 * Calculates the difference between the front end and the back end.
 *
 * @return {number} The length of the horizontal difference between the
 *  back edge and the front edge.
 */
function calculateBackFrontDifference() {
    var a = 0, b = 0;

    checkFloat(angle);
    checkFloat(boardLength);

    a = parseFloat(angle.value);
    b = parseFloat(boardLength.value);

    return Math.tan(parseFloat(a) * Math.PI/180) * parseFloat(b);
}

/**
 * Calculates the back length according to the angle and the front length.
 * Corrects directly the input text element.
 *
 */
function calculateBackLength() {
    var difference = calculateBackFrontDifference();

    checkFloat(frontLength);

    if(document.getElementById("tilt_right").checked == true)
        backLength.value = parseFloat(frontLength.value) + difference;
    else
        backLength.value = parseFloat(frontLength.value) - difference;
}

/**
 * Calculates the back length according to the angle and the front length.
 * Corrects directly the input text element.
 *
 */
function calculateFrontLength() {
    var difference = calculateBackFrontDifference();

    checkFloat(backLength);

    if(document.getElementById("tilt_right").checked == true)
        frontLength.value = parseFloat(backLength.value) - difference;
    else
        frontLength.value = parseFloat(backLength.value) + difference;
}

/**
 * Draws the representation of the cut and board.
 *
 */
function draw() {
    var vtp = 0;  //Value To Pixel
    var margin = 10;
    var bottom = parseInt(canvas.height) - margin; //To have the y go up and (0,0) is in the bottom left corner
    var cutPath = findCutPath();
    var bitPath = findBitPath(cutPath);

    if(document.getElementById("unit_in").checked == true)
        vtp = inchToPixel();
    else
        vtp = convertMmToIn(inchToPixel());

    //Convertion of the real value to the representation value
    cutPath.start.x = margin + cutPath.start.x * vtp;
    cutPath.start.y = bottom - cutPath.start.y * vtp;
    cutPath.end.x = margin + cutPath.end.x * vtp;
    cutPath.end.y = bottom - cutPath.end.y * vtp;

    bitPath.start.x = margin + bitPath.start.x * vtp;
    bitPath.start.y = bottom - bitPath.start.y * vtp;
    bitPath.end.x = margin + bitPath.end.x * vtp;
    bitPath.end.y = bottom - bitPath.end.y * vtp;

    ctx.clearRect(0 , 0 , canvas.width, canvas.height);  //Erase the old stuff

    //Drawing the front edge
    ctx.beginPath();
    ctx.moveTo(margin, cutPath.start.y);
    ctx.lineTo(cutPath.start.x, cutPath.start.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00FF00";
    ctx.stroke();

    //Drawing the back edge
    ctx.beginPath();
    ctx.moveTo(margin, cutPath.end.y);
    ctx.lineTo(cutPath.end.x, cutPath.end.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000FF";
    ctx.stroke();

    //Drawing the board
    ctx.beginPath();
    ctx.moveTo(margin, cutPath.start.y);
    ctx.lineTo(margin, cutPath.end.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    //Drawing the mitter
    ctx.beginPath();
    ctx.moveTo(bitPath.start.x, bitPath.start.y);
    ctx.lineTo(bitPath.end.x, bitPath.end.y);
    ctx.lineWidth = parseFloat(bitDiameter.value) * vtp;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();

    //Drawing the dot for the front edge
    ctx.beginPath();
    ctx.arc(cutPath.start.x, cutPath.start.y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#003300";
    ctx.stroke();

    //Drawing the dot for the back edge
    ctx.beginPath();
    ctx.arc(cutPath.end.x, cutPath.end.y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000033";
    ctx.stroke();

    //Drawing the cut
    ctx.beginPath();
    ctx.moveTo(cutPath.start.x, cutPath.start.y);
    ctx.lineTo(cutPath.end.x, cutPath.end.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
}

/**
 * Initializes the script.
 *
 */
function initialize() {
    bitDiameter= document.getElementById("bit_diameter");
    safeZ = document.getElementById("safe_z");
    angle = document.getElementById("angle");
    boardLength = document.getElementById("board_length");
    backLength = document.getElementById("back_length");
    frontLength = document.getElementById("front_length");
    boardThickness = document.getElementById("board_thickness");
    cutHeight = document.getElementById("cut_height");
    cutNumber = document.getElementById("cut_number");

    canvas = document.getElementById("canvas");
    canvas.height = document.getElementById("form_chop").clientHeight;
    canvas.width = parseInt(document.getElementById("form_chop").clientWidth)*2;
    ctx = canvas.getContext("2d");

    frontLength.disabled = cutBack;
    backLength.disabled = !cutBack;

    draw();

    //Explanations
    document.getElementById("show_explanations").addEventListener("click", function(event) {
        explanations = document.getElementById("explanations");
        if(explanations.style.display == "none" || explanations.style.display == "")
            explanations.style.display = "block";
        else
            explanations.style.display = "none";
    }, false);


    //Settings part
    //The conversion
    document.getElementById("unit_in").addEventListener("change", function(event) {
        bitDiameter.value    = convertMmToIn(bitDiameter.value);
        safeZ.value          = convertMmToIn(safeZ.value);
        boardLength.value    = convertMmToIn(boardLength.value);
        backLength.value     = convertMmToIn(backLength.value);
        frontLength.value    = convertMmToIn(frontLength.value);
        boardThickness.value = convertMmToIn(boardThickness.value);
        cutHeight.value      = convertMmToIn(cutHeight.value);
    }, false);

    document.getElementById("unit_mm").addEventListener("change", function(event) {
        bitDiameter.value    = convertInToMm(bitDiameter.value);
        safeZ.value          = convertInToMm(safeZ.value);
        boardLength.value    = convertInToMm(boardLength.value);
        backLength.value     = convertInToMm(backLength.value);
        frontLength.value    = convertInToMm(frontLength.value);
        boardThickness.value = convertInToMm(boardThickness.value);
        cutHeight.value      = convertInToMm(cutHeight.value);
    }, false);

    document.getElementById("in_to_px").addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });

    document.getElementById("bit_diameter").addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });

    //The angle change
    angle.addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });
    document.getElementById("tilt_right").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("tilt_left").addEventListener("change", function(e) {
        draw();
    });

    //The board change
    document.getElementById("front_length").addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });
    document.getElementById("back_length").addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });
    document.getElementById("board_length").addEventListener("change", function(e) {
        checkFloat(this);
        draw();
    });
    document.getElementById("reverse").addEventListener("click", function(e) {
        cutBack = !cutBack;
        frontLength.disabled = cutBack;
        backLength.disabled = !cutBack;
    });

    //Cut position
    document.getElementById("cut_pos_right").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("cut_pos_center").addEventListener("change", function(e) {
        draw();
    });

    document.getElementById("make").addEventListener("click", function(e) {
        var gcode = generateGCode();
        console.log("GCode generated:");
        console.log(gcode);
        alert(gcode);
        if(dashboard.machine) {
            //XXX: it seems to have a bug in the templates:
            //From the app_opensbpgenerator:
            // dashboard.machine.gcode(program, function(err) {
            //From the app_gcodegenerator:
            // dashboard.machine.sbp(gcode, function(err) {
            // I (Alex) think the code was swap
            dashboard.machine.gcode(program, function(err) {
                if(err)
                    console.log(err);
            });
        }
    });
}

window.onload = initialize;
