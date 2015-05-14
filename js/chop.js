//Global variables definition (initialized in the function "initialize"):
var bitDiameter;
var bitLength;
var safeZ;
var angle;
var boardLength;
var backLength;
var frontLength;
var boardThickness;
var cutHeight;
var canvas;
var ctx;
var cutBack = true;
var margin = 10;  //Margin in the canvas

/**
 * Change the width of the canvas (according to the edges).
 *
 */
function changeCanvasWidth() {
    var width = parseFloat(backLength.val());
    //We let a margin of 10 pixels to avoid display problems
    var parentW = parseFloat($("#canvas").parent().width()) - 10;

    if(width < parseFloat(frontLength.val()))
        width = parseFloat(frontLength.val());
    width = width * getValueToPixel() + 2 * margin;

    canvas.width = (width < parentW) ? width : parentW;
}

/**
 * Change the height of the canvas (according to the board length and inch to pixel).
 *
 */
function changeCanvasHeight() {
    var height = parseFloat(boardLength.val()) * getValueToPixel() + 2 * margin;
    canvas.height = (height < 600) ? height : 600;
}

/**
 * Finds the start and end position of the cut. Goes from the front to the back.
 * @return {object} The start position and the end position.
 */
function findCutPath() {
    var path = {start : {}, end : {}};

    if(cutBack)
        calculateFrontLength();
    else
        calculateBackLength();

    path.start.x = parseFloat(frontLength.val());
    path.start.y = 0;
    path.end.x = parseFloat(backLength.val());
    path.end.y = parseFloat(boardLength.val());

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

    if($("#cut_pos_right").prop("checked") == true) {
        checkFloat(bitDiameter);
        halfBit = (parseFloat(bitDiameter.val())) / 2;

        shift = halfBit * Math.cos(parseFloat(angle.val())*Math.PI/180);
        rise = halfBit * Math.sin(parseFloat(angle.val())*Math.PI/180);
        if($("#tilt_right").prop("checked") == true) {
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
    var z = 0.0;

    //check all the input
    checkFloat(bitDiameter);
    checkFloat(bitLength);
    checkFloat(safeZ);
    checkFloat(angle);
    checkFloat(boardLength);
    checkFloat(backLength);
    checkFloat(frontLength);
    checkFloat(boardThickness);
    checkFloat(cutHeight);

    var bitPath = findBitPath(findCutPath());
    // var zEnd = (parseFloat(boardThickness.val())-parseFloat(cutHeight.val())).toFixed(5);
    var zEnd = parseFloat(cutHeight.val()) - parseFloat(boardThickness.val());
    var bitL = parseFloat(bitLength.val());
    var safe = parseFloat(safeZ.value);

    gcode += "(Cutting straight)\n";
    if($("#unit_in").prop("checked") == true)
        gcode += "G20 (inches)\n";
    else
        gcode += "G21 (millimeters)\n";
    
    //TODO: see if it's good
    gcode += "(Go to the start cut position)\n";
    gcode += "G0 Z" + safe.toFixed(5) + "\n";
    gcode += "G0 X" + bitPath.start.x.toFixed(5) + " Y" + bitPath.start.y.toFixed(5) + "\n";

    gcode += "M3 (Spindle on clock wise)\n";
    gcode += "(Make the cut)\n";

    //Have to do multiple passes because of the height of the bit
    do {
        z -= bitL;
        if(z < zEnd)
            z = zEnd;
        gcode += "(One pass)\n";
        gcode += "G1 Z" + z.toFixed(5) + "\n";
        gcode += "G1 X" + bitPath.end.x.toFixed(5) + " Y" + bitPath.end.y.toFixed(5) + "\n";
        gcode += "(Go to the start cut position)\n";
        gcode += "G1 Z" + safe.toFixed(5) + "\n";
        gcode += "G0 X" + bitPath.start.x.toFixed(5) + " Y" + bitPath.start.y.toFixed(5) + "\n";
    } while(z > zEnd);

    gcode += "M8 (Spindle off)\n"
    gcode += "(Go to the initial position)\n";
    // gcode += "G0 X" + bitPath.start.x.toFixed(5) + " Y" + bitPath.start.y.toFixed(5) + "\n";
    gcode += "G0 X0 Y0\n";

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
 * @param {object} element Jquery input text element to check.
 */
function checkFloat(element) {
    if(isNaN(parseFloat(element.val())))
        element.val(0);
    else
        element.val(parseFloat(element.val()));
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
    checkFloat($("#in_to_px"));
    return parseFloat($("#in_to_px").val());
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

    a = parseFloat(angle.val());
    b = parseFloat(boardLength.val());

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

    if($("#tilt_right").prop("checked") == true)
        backLength.val(parseFloat(frontLength.val()) + difference);
    else
        backLength.val(parseFloat(frontLength.val()) - difference);
}

/**
 * Calculates the back length according to the angle and the front length.
 * Corrects directly the input text element.
 *
 */
function calculateFrontLength() {
    var difference = calculateBackFrontDifference();

    checkFloat(backLength);

    if($("#tilt_right").prop("checked") == true)
        frontLength.val(parseFloat(backLength.val()) - difference);
    else
        frontLength.val(parseFloat(backLength.val()) + difference);
}

/**
 * get the value to pixel. Used for the preview.
 *
 * @return {number} Returns the value to pixel
 */
function getValueToPixel() {
    if($("#unit_in").prop("checked") == true)
        return inchToPixel();
    else
        return convertMmToIn(inchToPixel());
}

/**
 * Draws the representation of the cut and board.
 *
 */
function draw() {
    var vtp = getValueToPixel();  //Value To Pixel
    var cutPath = findCutPath();
    var bitPath = findBitPath(cutPath);
    var bottom = 0; //To have the y go up and (0,0) is in the bottom left corner

    //Checking canvas size
    changeCanvasWidth();
    changeCanvasHeight();
    bottom = parseInt(canvas.height) - margin; //To have the y go up and (0,0) is in the bottom left corner

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
    ctx.lineWidth = parseFloat(bitDiameter.val()) * vtp;
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
    bitDiameter = $("#bit_diameter");
    bitLength = $("#bit_length");
    safeZ = $("#safe_z");
    angle = $("#angle");
    boardLength = $("#board_length");
    backLength = $("#back_length");
    frontLength = $("#front_length");
    boardThickness = $("#board_thickness");
    cutHeight = $("#cut_height");

    //NOTE: Don't use JQuery for canvas  => it acts weird when changing height
    canvas = document.getElementById("canvas");
    changeCanvasHeight();
    changeCanvasHeight();
    ctx = canvas.getContext("2d");

    frontLength.attr("disabled", cutBack);
    backLength.attr("disabled", !cutBack);

    draw();

    //Explanations
    $("#show_explanations").click(function(event) {
        $("#explanations").toggle();
    });

    //Settings part
    //The conversion
    $("#unit_in").change(function(event) {
        bitDiameter.val(convertMmToIn(bitDiameter.val()));
        bitLength.val(convertMmToIn(bitLength.val()));
        safeZ.val(convertMmToIn(safeZ.val()));
        boardLength.val(convertMmToIn(boardLength.val()));
        backLength.val(convertMmToIn(backLength.val()));
        frontLength.val(convertMmToIn(frontLength.val()));
        boardThickness.val(convertMmToIn(boardThickness.val()));
        cutHeight.val(convertMmToIn(cutHeight.val()));
    }, false);

    $("#unit_mm").change(function(event) {
        bitDiameter.val(convertInToMm(bitDiameter.val()));
        bitLength.val(convertInToMm(bitLength.val()));
        safeZ.val(convertInToMm(safeZ.val()));
        boardLength.val(convertInToMm(boardLength.val()));
        backLength.val(convertInToMm(backLength.val()));
        frontLength.val(convertInToMm(frontLength.val()));
        boardThickness.val(convertInToMm(boardThickness.val()));
        cutHeight.val(convertInToMm(cutHeight.val()));
    }, false);

    $("#in_to_px").change(function(e) {
        checkFloat($(this));
        draw();
    });

    bitDiameter.change(function(e) {
        checkFloat($(this));
        draw();
    });

    //The angle change
    angle.change(function(e) {
        checkFloat($(this));
        draw();
    });
    $("#tilt_right").change(function(e) {
        draw();
    });
    $("#tilt_left").change(function(e) {
        draw();
    });

    //The board change
    frontLength.change(function(e) {
        checkFloat($(this));
        draw();
    });
    backLength.change(function(e) {
        checkFloat($(this));
        draw();
    });
    boardLength.change(function(e) {
        checkFloat($(this));
        draw();
    });

    $("#reverse").click(function(e) {
        cutBack = !cutBack;
        frontLength.attr("disabled", cutBack);
        backLength.attr("disabled", !cutBack);
    });

    //Cut position
    $("#cut_pos_right").change(function(e) {
        draw();
    });
    $("#cut_pos_center").change(function(e) {
        draw();
    });

    $("#make").click(function(e) {
        var gcode = generateGCode();
        fabmoDashboard.submitJob(gcode, {filename : 'chop.nc'});
    });
}

window.onload = initialize;
