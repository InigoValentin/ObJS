/********************************************************************
 * Parameters used all along the script. Only for                   *
 * customization.                                                   *
 ********************************************************************/ 
var backColor = "rgba(200, 200, 200, 1)";
var vertColor = "rgba(10, 10, 10, 1)";
var edgeColor = "rgba(100, 70, 70, 1)";
var faceColor = "rgba(180, 180, 255, .6)";
var faceAlpha = .6;
var textColor = "rgba(0, 0, 0, 1)";
var vertSize = 4; //Make it even: at small scales will look better
var rotationSpeed = 100; //Smaller = faster. 100 is a good speed

/********************************************************************
 * Parameters used to scale the measures in the .obj file. Can be   *
 * integer or float, greater than 0. 50 is a good default.          *
 ********************************************************************/
var scale;

/********************************************************************
 * Global variable to determine if the mouse button is being holded *
 * down.                                                            *
 ********************************************************************/ 
var mDown = false;

/********************************************************************
 * Global variables containing the canvas and its context.          *
 ********************************************************************/ 
var canvas;
var ctx;

/********************************************************************
 * Global variables containing the number of elements.              *
 ********************************************************************/ 
var totalVert;
var totalEdge;//TODO: I dont know how to calculate. And I dont need it
var totalFace

/********************************************************************
 * Arrays containing the vertices, edges and faces.                 *
 ********************************************************************/ 
var obj; //Unused
var vert;
var face;

/********************************************************************
 * Booleans to determine wich elements are to draw.                 *
 ********************************************************************/ 
var dVerts = true;
var dEdges = true;
var dFaces = true;
var dBackg = true;

/********************************************************************
 * Global variables that will contain the position of the mouse in  *
 * the previous frame to calculate rotation.                        *
 ********************************************************************/ 
var pX = null;
var pY = null;

/********************************************************************
 * Function switching the elements to draw (dVerts, dEdges, dFaces) *
 * #parameters:                                                     *
 *   name (string): key to the element to draw.                     *
 *   value (boolean): indicating if the element is to be drawn.     *
 * #return: nothing                                                 *
 ********************************************************************/ 
function drawElement(name, value){
	switch (name){
		case "verts":
			dVerts = value;
			break;
		case "edges":
			dEdges = value;
			break;
		case "faces":
			dFaces = value;
			break;
		case "backg":
			dBackg = value;
			break;
	}
	draw();
}
/********************************************************************
 * Function that turns a hex color code in RGB.                     *
 * stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb    *
 * #parameters:                                                     *
 *   hex (string): color code, for example "#33ff99"                *
 * #return: (Array) r, g, b, with their correspondent color.        *
 ********************************************************************/ 
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

/********************************************************************
 * Function switching the color of the elements.                    *
 * #parameters:                                                     *
 *   name (string): key to the element to colorize.                 *
 *   value (boolean): indicating if the element is to be drawn.     *
 * #return: nothing                                                 *
 ********************************************************************/ 
function colorElement(name, value){
	var color = hexToRgb(value)
	var str = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)"
	switch (name){
		case "backg":
			backColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			break;
		case "verts":
			vertColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			break;
		case "edges":
			edgeColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			break;
		case "faces":
			faceColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", " + faceAlpha + ")";
			break;
	}
	draw();
}

/********************************************************************
 * Function switching the alpha value of the faces.                 *
 * #parameters:                                                     *
 *   percent (int): Value (0-100) of alpha. Must be processed (0-1) *
 * #return: nothing                                                 *
 ********************************************************************/ 
function setAlpha(percent){
	faceAlpha = percent / 100;
	faceColor = faceColor.substring(0, faceColor.lastIndexOf(",") + 2) + faceAlpha + ")";
	draw();
}

/********************************************************************
 * Main function, called every time a file is to be loaded.         *
 * #parameters:                                                     *
 *   val (string): name of the file, without path or extension.     *
 * #return: nothing                                                 *
 ********************************************************************/ 
function loadModel(val){
	//Get file
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/obj/" + val.value + ".obj", false);
	xmlhttp.send();
	var fileContent = xmlhttp.responseText;
	initArrays();
	if (canvas == null)
		initCanvas();
	readVerts(fileContent);
	readFaces(fileContent);
	draw();
}

/********************************************************************
 * Function initializing the arrays obj, vert and face as empty     *
 * arrays.                                                          *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/ 
function initArrays(){
	obj =  null;
	vert = null;
	face = null;
	obj =  new Array();
	vert = new Array();
	face = new Array();
}

/********************************************************************
 * Function tat populates the vert[] array with and array of three  *
 * elements, containig the coordinates, with the scale applied.     *
 * #parameters:                                                     *
 *   text (string): the content of the obj file.                    *
 * #return: nothing                                                 *
 ********************************************************************/ 
function readVerts(text){
	var line;
	var i = 0;
	var max = 0;
	var dist;
	while (text.indexOf("v ") != -1){
		line = text.substring(text.indexOf("v "), text.indexOf("\n", text.indexOf("v ")));
		vert[i] = new Array(3);
		line = line.substring(2);
		vert[i][0] = line.substring(0, line.indexOf(" "));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][1] = line.substring(0, line.indexOf(" "));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][2] = line;
		text = text.substring(text.indexOf("v ") + 1)
		dist = Math.sqrt(vert[i][0] * vert[i][0] + vert[i][1] * vert[i][1] + vert[i][2] * vert[i][2]);
		if (dist > max)
			max = dist;
		i = i + 1;
	}
	scale = calculateScale(max);
	totalVert = vert.length;
}

/********************************************************************
 * Function that automatically calculates the best scale for the    *
 * modelermined number of elements, containing the verices that     *
 * form a face, so the bigest dimension from the object can fit in  *
 * the smallest dimension of the canvas.                            *
 * #parameters:                                                     *
 *   text (int): the farthest vertex, from the center.              *
 * #return: (int) The scale to be aplied.                           *
 ********************************************************************/ 
function calculateScale(max){
	var dim;
	if (canvas.width < canvas.height)
		dim = canvas.width;
	else
		dim = canvas.height;
	var sc = Math.round((0.95 * dim) / (2 * max));
	return sc;
}

/********************************************************************
 * Function that populates the face[] array with and array of an    *
 * undetermined number of elements, containing the verices that     *
 * form a face.                                                     *
 * #parameters:                                                     *
 *   text (string): the content of the obj file.                    *
 * #return: nothing                                                 *
 ********************************************************************/ 
function readFaces(text){
	var finish = false;
	var line;
	var i = 0;
	var j;
	while (text.indexOf("f ") != -1){
		line = text.substring(text.indexOf("f "), text.indexOf("\n", text.indexOf("f ")));
		line = line.substring(2);
		face[i] = new Array();
		j = 0;
		while(line.indexOf(" ") != -1){
			face[i][j] = line.substring(0, line.indexOf(" ")) - 1;
			line = line.substring(line.indexOf(" ") + 1);
			j = j + 1;
		}
		face[i][j] = line - 1;
		i = i + 1;
		text = text.substring(text.indexOf("f ") + 1)	
	}
	totalFace = face.length;
}

/********************************************************************
 * Function that compares the average Z coordinate of two faces.    *
 * Must be used when sorting the face array.                        *
 * #parameters:                                                     *
 *   a (Array): One face.                                           *
 *   b (Array): The other face.                                     *
 * #return: (int) -1, 1 or 0.                                       *
 ********************************************************************/ 
function faceComparator(a,b){
	var aZ;
	var bZ;
	var i = 0;
	var sum = 0.0;
	while (i < a.length){
		sum = sum + parseFloat(vert[a[i]][2]);
		i = i + 1;
	}
	aZ = sum / parseFloat(i);
	i = 0;
	sum = 0;
	while (i < b.length){
		sum = sum + parseFloat(1 * vert[b[i]][2]);
		i = i + 1;
	}
	bZ = sum / parseFloat(i);
	if (aZ < bZ) return -1;
	if (aZ > bZ) return 1;
	return 0;
}

/********************************************************************
 * Function that writes text in the corner of the canvas. Must be   *
 * called when everithing has been drawn.                           *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function writeCredits(){
	ctx.fillStyle = textColor;
	ctx.font = "12px Arial";
	var h = canvas.height / 2 - 14;
	var w = 10 - (canvas.height / 2);
	ctx.fillText("ObJS   " + totalVert + " vertizes   " + totalFace + " faces", w, h);
}

/********************************************************************
 * Function that draws th vertizes, faces and edges in the canvas.  *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function draw(){
	face = face.sort(faceComparator).reverse();
	clearCanvas();
	for (var i = 0; i < face.length; i++){
		ctx.strokeStyle = edgeColor;
		ctx.fillStyle = vertColor;
		ctx.beginPath();
		ctx.moveTo(scale * vert[face[i][0]][0], scale * vert[face[i][0]][1]);
		for (var j = 1; j < face[i].length; j++) {
			ctx.lineTo(scale * vert[face[i][j]][0], scale * vert[face[i][j]][1]);
			if(dEdges)
				ctx.stroke();
			if(dVerts){
				var x = scale * vert[face[i][j]][0] - (vertSize / 2);
				var w = vertSize;
				var y = scale * vert[face[i][j]][1] - (vertSize / 2);
				var h = vertSize;
				ctx.fillRect(x, y, w, h);
			}
		}
		ctx.closePath();
		ctx.fillStyle = faceColor;
		if(dFaces)
			ctx.fill();
	}
	writeCredits();
}

/********************************************************************
 * Function that rotates elements in the canvas along the Y axis,   *
 * calculating the new position for each vertex in the vert array.  *
 * #parameters:                                                     *
 *   des (int): mouse displacement from the last frame.             *
 * #return: nothing                                                 *
 ********************************************************************/
function rotateY(des) {
	for (var i = 0; i < vert.length; i ++) {
		var x = vert[i][0];
		var z = vert[i][2];
		vert[i][0] = x * Math.cos(des / rotationSpeed) - z * Math.sin(des / rotationSpeed);
		vert[i][2] = z * Math.cos(des / rotationSpeed) + x * Math.sin(des / rotationSpeed);
	}
};

/********************************************************************
 * Function that rotates elements in the canvas along the X axis,   *
 * calculating the new position for each vertex in the vert array.  *
 * #parameters:                                                     *
 *   des (int): mouse displacement from the last frame.             *
 * #return: nothing                                                 *
 ********************************************************************/
function rotateX(des) {
	for (var i = 0; i < vert.length; i ++) {
		var y = vert[i][1];
		var z = vert[i][2];
		vert[i][1] = y * Math.cos(des / rotationSpeed) - z * Math.sin(des / rotationSpeed);
		vert[i][2] = z * Math.cos(des / rotationSpeed) + y * Math.sin(des / rotationSpeed);
	}
};

/********************************************************************
 * Function that initializes the canvas, assignin it to the HTML    *
 * element, and set the required mouse events.                      *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function initCanvas(){
	canvas = document.getElementById("ObJSCanvas");
	ctx = canvas.getContext("2d");
	ctx.translate(canvas.width / 2, canvas.height / 2);
	
	canvas.onmousedown = function(e){
		pX = e.offsetX==undefined?e.layerX:e.offsetX;
		pY = e.offsetY==undefined?e.layerY:e.offsetY;
		mDown = true;
	}
		
	canvas.onmouseup = function(e){
		if(mDown) 
			mouseClick(e);
		pX = null;
		pY = null;
		mDown = false;
	}
		
	canvas.onmousemove = function(e){
		if(!mDown) 
			return;
		var x = e.offsetX==undefined?e.layerX:e.offsetX;
		var y = e.offsetY==undefined?e.layerY:e.offsetY;
		rotateY(x - pX);
		rotateX(y - pY);
		pX = x;
		pY = y;
		draw();
		return false;
	}
	
	canvas.addEventListener('mousewheel',function(event){
		if (event.wheelDelta > 0)
			zoom("-");
		else 
			zoom("+");
		return false;
	}, false);
}

/********************************************************************
 * Function that changes the scale variable, witch results in a     *
 * zoom in or zoom out effect.                                      *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function zoom(dir){
	if (dir == "+")
		scale = Math.round(scale * 1.2);
	if (dir == "-")
		scale = Math.round(scale * 0.8);
	draw();
}

/********************************************************************
 * Function that clears the canvas and gets it ready to draw on it. *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (dBackg)
		ctx.fillStyle = backColor;
	else
		ctx.fillStyle = "#ffffff";
	ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
}

/********************************************************************
 * TODO: Function used when something in the canvas is clicked.     *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function mouseClick(){
}