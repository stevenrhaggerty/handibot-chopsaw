//Global variables definition:
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
var inToPx=10;  //Define how much pixel a inch is equal
var cutBack = true;

function convertInToMm(inches) {
    return (isNaN(inches)) ? 0.0 : (parseFloat(inches) * 25.4);
}

function convertMmToIn(millimeters) {
    return (isNaN(millimeters)) ? 0.0 : (parseFloat(millimeters) / 25.4);
}

function draw() {
    var itp = 0;  //Inch To Pixel
    var bottom = 290; //To have the y go up and (0,0) is in the bottom left corner
    var xFront, yFront, xBack, yBack;
    if( document.getElementById("unit_in").checked == true)
        itp = inToPx;
    else
        itp = convertMmToIn(inToPx);

    if(cutBack)
        calculateFrontLength();
    else
        calculateBackLength();

    //TODO: décaller si centrer ou à drotie
    xFront = parseFloat(frontLength.value) * itp;
    yFront = bottom;
    xBack = parseFloat(backLength.value) * itp;
    yBack = bottom - (parseFloat(boardLength.value) * itp);

    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );

    //Drawing the back
    ctx.beginPath();
    ctx.moveTo(0, yBack);
    ctx.lineTo(xBack, yBack);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000FF";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xBack, yBack, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000033";
    ctx.stroke();

    //Drawing the front
    ctx.beginPath();
    ctx.moveTo(0, yFront);
    ctx.lineTo(xFront, yFront);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00FF00";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xFront, yFront, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#003300";
    ctx.stroke();

    //Drawing the board
    ctx.beginPath();
    ctx.moveTo(0, yBack);
    ctx.lineTo(0, yFront);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    //Drawing the mitter
    ctx.beginPath();
    if(document.getElementById("cut_pos_right").checked == true) {
        ctx.moveTo((parseFloat(bitDiameter.value)) + xBack, yBack);
        ctx.lineTo((parseFloat(bitDiameter.value)) + xFront, yFront);
    }
    else {
        ctx.moveTo(xBack, yBack);
        ctx.lineTo(xFront, yFront);
    }
    ctx.lineWidth = parseFloat(bitDiameter.value) * itp;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();

    //Drawing the cut
    ctx.beginPath();
    ctx.moveTo(xBack, yBack);
    ctx.lineTo(xFront, yFront);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
}

//Calculate the difference between the front end and the back end
//Return false if error
function calculateBackFrontDifference() {
    var a = parseFloat(angle.value), b = parseFloat(boardLength.value);
    var f = parseFloat(frontLength.value);
    if(isNaN(a) || isNaN(b) || isNaN(f)) {
        console.error("Wrong value to calculate the back length");
        return;
    }
    return Math.tan(parseFloat(a) * Math.PI/180) * parseFloat(b);
}

//Calculate the back length according to the angle and the front length
function calculateBackLength() {
    var difference = calculateBackFrontDifference();
    //frontLength was checked in calculateBackFrontDifference
    if(difference === false)
        return;

    if(document.getElementById("tilt_right").checked == true)
        backLength.value = parseFloat(frontLength.value) + difference;
    else
        backLength.value = parseFloat(frontLength.value) - difference;
}

//Calculate the back length according to the angle and the front length
function calculateFrontLength() {
    var difference = calculateBackFrontDifference();
    //frontLength was checked in calculateBackFrontDifference
    if(difference === false || isNaN(parseFloat(backLength.value)))
        return;

    if(document.getElementById("tilt_right").checked == true)
        frontLength.value = parseFloat(backLength.value) - difference;
    else
        frontLength.value = parseFloat(backLength.value) + difference;
}

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
    ctx = canvas.getContext("2d");

    frontLength.disabled = cutBack;
    backLength.disabled = !cutBack;

    draw();
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

    document.getElementById("bit_diameter").addEventListener("change", function(e) {
        draw();
    });

    //The angle change
    angle.addEventListener("change", function(e) {
        // calculateBackLength();
        draw();
    });
    document.getElementById("tilt_right").addEventListener("change", function(e) {
        // calculateBackLength();
        draw();
    });
    document.getElementById("tilt_left").addEventListener("change", function(e) {
        // calculateBackLength();
        draw();
    });

    //Cut position
    document.getElementById("cut_pos_right").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("cut_pos_center").addEventListener("change", function(e) {
        draw();
    });

    //The board change
    document.getElementById("front_length").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("back_length").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("board_length").addEventListener("change", function(e) {
        draw();
    });
    document.getElementById("reverse").addEventListener("click", function(e) {
        cutBack = !cutBack;
        frontLength.disabled = cutBack;
        backLength.disabled = !cutBack;
    });

}

window.onload = initialize;
