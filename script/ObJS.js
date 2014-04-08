/********************************************************************
 * Parameters used all along the script. Only for                   *
 * customization.                                                   *
 ********************************************************************/ 
var backColor = "rgba(200, 200, 200, 1)";
var vertColor = "rgba(10, 10, 10, 1)";
var edgeColor = "rgba(200, 0, 0, 1)";
var faceColor = "rgba(180, 180, 255, .3)";
var textColor = "rgba(0, 0, 0, 1)";
var vertSize = 6; //Make it even: at small scales will look better
var rotationSpeed = 100; //Smaller = faster

/********************************************************************
 * Parameters used to scale the measures in the .obj file. Can be   *
 * integer or float, greater than 0                                 *
 * TODO: Must be automatically calculated according to the canvas   *
 * dimensions, so the bigest dimension from the object can fit in   *
 * the smallest dimension of the canvas.                            *
 ********************************************************************/
var scale = 50;

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

/********************************************************************
 * Global variables that will contain the position of the mouse in  *
 * the previous frame to calculate rotation.                        *
 ********************************************************************/ 
var pX = null;
var pY = null;

/********************************************************************
 * Function switching the elements to draw (dVerts, dEdges, dFaces) *
 * @parameters:                                                     *
 *   name (string): key to the element to draw.                     *
 *   value (boolean): indicating if the element is to be drawn.     *
 * @return: nothing                                                 *
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
	}
	draw();
}

/********************************************************************
 * Main function, called every time a file is to be loaded.         *
 * @parameters:                                                     *
 *   val (string): name of the file, without path or extension.     *
 * @return: nothing                                                 *
 ********************************************************************/ 
function loadModel(val){
	//Get file
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/obj/" + val.value + ".obj", false);
	xmlhttp.send();
	var fileContent = xmlhttp.responseText;
	initArrays();
	readVerts(fileContent);
	readFaces(fileContent);
	draw();
}

/********************************************************************
 * Function initializing the arrays obj, vert and face as empty     *
 * arrays.                                                          *
 * @parameters: none                                                *
 * @return: nothing                                                 *
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
 * @parameters:                                                     *
 *   text (string): the content of the obj file.                    *
 * @return: nothing                                                 *
 ********************************************************************/ 
function readVerts(text){
	var line;
	var i = 0;
	while (text.indexOf("v ") != -1){
		line = text.substring(text.indexOf("v "), text.indexOf("\n", text.indexOf("v ")));
		vert[i] = new Array(3);
		line = line.substring(2);
		vert[i][0] = Math.round(scale * Math.round(line.substring(0, line.indexOf(" "))));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][1] = Math.round(scale * Math.round(line.substring(0, line.indexOf(" "))));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][2] = Math.round(scale * Math.round(line));
		i = i + 1;
		text = text.substring(text.indexOf("v ") + 1)
	}	
}

/********************************************************************
 * Function that populates the face[] array with and array of an    *
 * undetermined number of elements, containing the verices that     *
 * form a face.                                                     *
 * @parameters:                                                     *
 *   text (string): the content of the obj file.                    *
 * @return: nothing                                                 *
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
}

/********************************************************************
 * Function that draws the vertizes in the canvas.                  *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/ 
function drawVerts(){
	ctx.fillStyle = vertColor;
	var x;
	var y;
	var w;
	var h;
	for (var i = 0; i < vert.length; i++) {
		x = vert[i][0] - (vertSize / 2);
		w = vertSize;
		y = vert[i][1] - (vertSize / 2);
		h = vertSize;
		ctx.fillRect(x, y, w, h);
	}
}

/********************************************************************
 * Function that draws the edges and the faces in the canvas, if    *
 * they are to be drawn according to dEdges and dFaces.             *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/
function drawFaces(){
	for (var i = 0; i < face.length; i++){
		ctx.fillStyle = edgeColor;
		ctx.beginPath();
		ctx.moveTo(vert[face[i][0]][0], vert[face[i][0]][1]);
		for (var j = 1; j < face[i].length; j++) {
			ctx.lineTo(vert[face[i][j]][0], vert[face[i][j]][1]);
			if(dEdges)
				ctx.stroke();
				
		}
		ctx.closePath();
		ctx.fillStyle = faceColor;
		if(dFaces)
			ctx.fill();
	}
}

/********************************************************************
 * Function that writes text in the corner of the canvas. Must be   *
 * called when everithing has been drawn.                           *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/
function writeCredits(){
	ctx.fillStyle = textColor;
	ctx.font = "12px Arial";
	var h = canvas.height / 2 - 14;
	var w = canvas.width / 2 - 45;
	ctx.fillText("ObJS", w, h);
}

/********************************************************************
 * Function that calls every neccesary function to draw the canvas. *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/
function draw(){
	initCanvas();
	if (dFaces || dEdges)
		drawFaces();
	if (dVerts)
		drawVerts();
	writeCredits();
}

/********************************************************************
 * Function that rotates elements in the canvas along the Y axis,   *
 * calculating the new position for each vertex in the vert array.  *
 * @parameters:                                                     *
 *   des (int): mouse displacement from the last frame.             *
 * @return: nothing                                                 *
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
 * @parameters:                                                     *
 *   des (int): mouse displacement from the last frame.             *
 * @return: nothing                                                 *
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
 * Function that gets the canvas ready to be drawn. It initializes  *
 * the canvas and ctx variables if they arent already, seting mouse *
 * events for them, clears the canvas and sets the background.      *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/
function initCanvas(){
	if (canvas == null){
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
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = backColor;
	ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
}

/********************************************************************
 * TODO: Function used when something in the canvas is clicked.     *
 * @parameters: none                                                *
 * @return: nothing                                                 *
 ********************************************************************/
function mouseClick(){
}