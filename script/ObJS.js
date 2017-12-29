/********************************************************************
 * The ObJS objectnitializes the canvas, assignin it to the HTML    *
 * element, and set the required mouse events.                      *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function ObJS(){
	
	/********************************************************************
	 * Parameters for costumization.                                    *
	 ********************************************************************/ 
	var backColor = "rgba(200, 200, 200, 1)";
	var vertColor = "rgba(10, 10, 10, 1)";
	var edgeColor = "rgba(100, 70, 70, 1)";
	var faceColor = "rgba(180, 180, 255, .6)";
	var faceAlpha = .6;
	var textColor = "rgba(0, 0, 0, 1)";
	var vertSize = 4; //Make it even: at small scales will look better
	var rotationSpeed = 90; //Smaller = faster. 100 is a good speed
	var zoomSpeed = 0.161; //0-1. 0.2 or 0.3 are good speeds
	var moveSpeed = .5;
	
	/********************************************************************
	 * Variable containing this object, to be refered from nested       *
	 * functions.                                                       *
	 ********************************************************************/ 
	var thisObJS;
	
	/********************************************************************
	 * Parameter used to scale the measures in the .obj file. Can be    *
	 * integer or float, greater than 0. 50 is a good default.          *
	 ********************************************************************/
	var scale;
	
	/********************************************************************
	 * Variable to determine if the canvas has been initialized.        *
	 ********************************************************************/ 
	var canvasInitialized = false;
	
	/********************************************************************
	 * Variable to determine if the mouse button is being holded down.  *
	 ********************************************************************/ 
	var mDown = false;
	var pinch = false;
	var pinchScale = 0;
	
	/********************************************************************
	 * Variables containing the canvas and its context.                 *
	 ********************************************************************/ 
	var canvas;
	var ctx;
	
	/********************************************************************
	 * Variables containing the number of elements.                     *
	 ********************************************************************/ 
	var totalVert;
	var totalMaterial = 0;
	var totalFace
	
	/********************************************************************
	 * Arrays containing the vertices, faces and materials.             *
	 ********************************************************************/ 
	var material;
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
	 * Booleans to indicate if mtl file should be used.                 *
	 ********************************************************************/
	var hasMtl = true;
	var useMtl = true;
	
	/********************************************************************
	 * Global variables that will contain the position of the mouse in  *
	 * the previous frame to calculate rotation.                        *
	 ********************************************************************/ 
	var pX = null;
	var pY = null;
	
	/********************************************************************
	 * Function that initializes the canvas, assignin it to the HTML    *
	 * element, and set the required mouse events.                      *
	 * #parameters:                                                     *
	 *   canv (canvas): canvas to use. If omited, the one named         *
	 *                  named "ObJSCanvas" will be used.                *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/	
	this.initCanvas = function(canv){
		if (!canvasInitialized){
			if (canv!= null)
				canvas = canv;
			else
				canvas = document.getElementById("ObJSCanvas");
			ctx = canvas.getContext("2d");
			ctx.translate(canvas.width / 2, canvas.height / 2);
			
			canvas.onmousedown = function(e){
				pX = e.offsetX==undefined?e.layerX:e.offsetX;
				pY = e.offsetY==undefined?e.layerY:e.offsetY;
				mDown = true;
			};
			
			canvas.onmouseup = function(e){
				if(mDown) 
					mouseClick(e);
				pX = null;
				pY = null;
				mDown = false;
			};
			
			canvas.onmousemove = function(e){
				if(!mDown) 
					return;
				var x = e.offsetX==undefined?e.layerX:e.offsetX;
				var y = e.offsetY==undefined?e.layerY:e.offsetY;
				if (e.shiftKey){
					thisObJS.moveHorizontal(x - pX);
					thisObJS.moveVertical(y - pY);
				}
				else{
					thisObJS.rotateY(x - pX);
					thisObJS.rotateX(y - pY);
				}
				pX = x;
				pY = y;
				return false;
			};
			
			canvas.onmouseout = function(e){
				if(mDown)
					mDown = false;
			}
			
			canvas.addEventListener('mousewheel',function(e){
				e.preventDefault();
				if (event.wheelDelta > 0)
					thisObJS.zoom(1);
				else 
					thisObJS.zoom(-1);
				return false;
			}, false);
			
			canvas.addEventListener('touchstart',function(e){
				if(e.touches.length == 2) {
					pinch = true;
					pinchScale = Math.sqrt((e.touches[0].clientX-e.touches[1].clientX) * (e.touches[0].clientX-e.touches[1].clientX) + (e.touches[0].clientY-e.touches[1].clientY) * (e.touches[0].clientY-e.touches[1].clientY));
				}
				return false;
			}, false);
			
			canvas.addEventListener('touchend',function(e){
				if(pinch)
					pinch = false;
				return false;
			}, false);
			
			canvas.addEventListener('touchcancel',function(e){
				if(pinch)
					pinch = false;
				return false;
			}, false);
			
			canvas.addEventListener('touchleave',function(e){
				if(pinch)
					pinch = false;
				return false;
			}, false);
			
			canvas.addEventListener('touchmove',function(e){
				e.preventDefault();
				if(pinch){
					var dist = Math.sqrt((e.touches[0].clientX-e.touches[1].clientX) * (e.touches[0].clientX-e.touches[1].clientX) + (e.touches[0].clientY-e.touches[1].clientY) * (e.touches[0].clientY-e.touches[1].clientY));
					if (dist > pinchScale)
						thisObJS.zoom(1);
					else if (dist < pinchScale)
						thisObJS.zoom(-1);
					pinchScale = dist;
				}
				else{
					var x = e.touches[0].clientX
					var y = e.touches[0].clientY;
					thisObJS.rotateY(x - pX);
					thisObJS.rotateX(y - pY);
					pX = x;
					pY = y;
				}
				return false;
			}, false);
			
			canvasInitialized = true;
		}
	};
	
	/********************************************************************
	 * Main function, called every time a file is to be loaded.         *
	 * #parameters:                                                     *
	 *   file (string): name of the file, without path or extension.    *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.load = function(file){
		if(!canvasInitialized)
			initCanvas();
		//Get obj file
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", file, false);
		xmlhttp.send();
		var fileContent = xmlhttp.responseText;
		//Get mtl file
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET",file.substring(0, file.lastIndexOf(".")) + ".mtl", false);
		xmlhttp.send();
		var mtlContent = xmlhttp.responseText;
		initArrays();
		readFile(fileContent);
		readMtlFile(mtlContent);
		draw();
	};
	/********************************************************************
	 * Getters that determine if an element is being drawn.             *
	 ********************************************************************/
	this.isBackgroundDrawn = function(){
		return dBackg;
	};
	
	this.isVertexDrawn = function(){
		return dVerts;
	};
	
	this.isEdgeDrawn = function(){
		return dEdges;
	};
	
	this.isFaceDrawn = function(){
		return dFaces;
	};
	
	this.isMaterialUsed = function(){
		return useMtl;
	};
	/********************************************************************
	 * Getters that determine if the model has associated materials.    *
	 ********************************************************************/
	this.hasMaterial = function(){
		return hasMtl;
	};
	
	/********************************************************************
	 * Getters for the color of the elements.                           *
	 ********************************************************************/
	this.getBackgroundColor = function (){
		var str = backColor;
		var r = str.substring(5, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var g = str.substring(0, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var b = str.substring(0, str.indexOf(', '));
		var a = 1;
		return {red: r, green: g, blue: b, alpha: a};
	};
	
	this.getVertexColor = function (){
		var str = vertColor;
		var r = str.substring(5, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var g = str.substring(0, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var b = str.substring(0, str.indexOf(', '));
		var a = 1;
		return {red: r, green: g, blue: b, alpha: a};
	};
	
	this.getEdgeColor = function (){
		var str = edgeColor;
		var r = str.substring(5, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var g = str.substring(0, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var b = str.substring(0, str.indexOf(', '));
		var a = 1;
		return {red: r, green: g, blue: b, alpha: a};
	};
	
	this.getFaceColor = function (){
		var str = faceColor;
		var r = str.substring(5, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var g = str.substring(0, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var b = str.substring(0, str.indexOf(', '));
		str = str.substring(str.indexOf(', ') + 2);
		var a = str.substring(0, str.indexOf(')'));
		return {red: r, green: g, blue: b, alpha: a};
	};
	
	/********************************************************************
	 * Functions switching the elements drawn (dVerts, dEdges, dFaces). *
	 * #parameters:                                                     *
	 *   on (boolean): indicating if the element is to be drawn.        *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.drawVertices = function(on){
		if (on == true || on == false){
			dVerts = on;
			draw();
		}
	};
	
	this.drawEdges = function(on){
		if (on == true || on == false){
			dEdges = on;
			draw();
		}
	};
	
	this.drawFaces = function(on){
		if (on == true || on == false){
			dFaces = on;
			draw();
		}
	};
	
	this.drawBackground = function(on){
		if (on == true || on == false){
			dBackg = on;
			draw();
		}
	};
	
	/********************************************************************
	 * Functions switching the color of the elements.                   *
	 * #parameters:                                                     *
	 *   code (string): hex color value, in #fff or #ffffff form. If    *
	 *                  wrong, a message will be printed to console,    *
	 *                  and nothing will be changed.                    *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.setVerticesColor = function(code){
		if (isColor(code)){
			var color = hexToRgb(code);
			vertColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			draw();
		}
		else
			console.log("setVerticesColor(" + code + ") ERROR: " + code + " not a valid hex color");
	};
	
	this.setEdgesColor = function(code){
		if (isColor(code)){
			var color = hexToRgb(code);
			edgeColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			draw();
		}
		else
			console.log("setEdgesColor(" + code + ") ERROR: " + code + " not a valid hex color");
	};
	
	this.setFacesColor = function(code){
		if (isColor(code)){
			var color = hexToRgb(code);
			faceColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			draw();
		}
		else
			console.log("setFacesColor(" + code + ") ERROR: " + code + " not a valid hex color");
	};
	
	this.setBackgroundColor = function(code){
		if (isColor(code)){
			var color = hexToRgb(code);
			backColor = "rgba(" + color.r + ", " + color.g + ", "  + color.b + ", 1)";
			draw();
		}
		else
			console.log("setBackgroundColor(" + code + ") ERROR: " + code + " not a valid hex color");
	};
	
	/********************************************************************
	 * Function switching the use of mtl file for color.                *
	 * #parameters:                                                     *
	 *   value (boolean): indicating if the element is to be drawn.     *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.linkMaterial = function(value){
		useMtl = value;
		draw();
	}
	
	/********************************************************************
	 * Function switching the alpha value of the faces.                 *
	 * #parameters:                                                     *
	 *   percent (int): Value (0-100) of alpha. Must be processed (0-1) *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.setAlpha = function(percent){
		if (percent >= 0 && percent <= 100){
			faceAlpha = percent / 100;
			faceColor = faceColor.substring(0, faceColor.lastIndexOf(",") + 2) + faceAlpha + ")";
			draw();
		}
		else
			console.log("setAlpha(" + percent + "); ERROR: Only values between 0 and 100 are allowed");
	};
	
	/********************************************************************
	 * Function switching the rotation speed.                           *
	 * #parameters:                                                     *
	 *   percent (int): Value (0-10) of speed.                          *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.setRotationSpeed = function(percent){
		if (percent >= 0 && percent <= 10){
			rotationSpeed = Math.round((10 - percent) * 30);
			if (rotationSpeed == 0)
				rotationSpeed = 1;
		}
		else
			console.log("setRotationSpeed(" + percent + "); ERROR: Only values between 0 and 10 are allowed");
	}
	
	/********************************************************************
	 * Functions that rotate elements in the canvas along the           *
	 * correspondent axys, calculating the new position for each vertex *
	 * in the vert array.                                               *
	 * #parameters:                                                     *
	 *   des (int): distance to rotate.                                 *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.rotateY = function(des){
		for (var i = 0; i < vert.length; i ++) {
			var x = vert[i][0];
			var z = vert[i][2];
			vert[i][0] = x * Math.cos(des / rotationSpeed) - z * Math.sin(des / rotationSpeed);
			vert[i][2] = z * Math.cos(des / rotationSpeed) + x * Math.sin(des / rotationSpeed);
		}
		draw();
	};
	
	this.rotateX = function(des){
		for (var i = 0; i < vert.length; i ++) {
			var y = vert[i][1];
			var z = vert[i][2];
			vert[i][1] = y * Math.cos(des / rotationSpeed) - z * Math.sin(des / rotationSpeed);
			vert[i][2] = z * Math.cos(des / rotationSpeed) + y * Math.sin(des / rotationSpeed);
		}
		draw();
	};
	
	/********************************************************************
	 * Function switching the movement speed of the model.              *
	 * #parameters:                                                     *
	 *   percent (int): Value (0-10) of speed.                          *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.setMovementSpeed = function(percent){
		if (percent >= 0 && percent <= 10)
			moveSpeed = ((percent * 0.8) / 10) + 0.01;
		else
			console.log("setMoveSpeed(" + percent + "); ERROR: Only values between 0 and 10 are allowed");
	}
	
	/********************************************************************
	 * Functions that move elements in the canvas along the selected    *
	 * direction, calculating the new position for each vertex in the   *
	 * vert array.                                                      *
	 * #parameters:                                                     *
	 *   des (int): distance to move.                                   *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.moveVertical = function(des){
		for (var i = 0; i < vert.length; i ++)
			vert[i][1] = (vert[i][1] * 1) + des * (moveSpeed / 50);
		draw();
	};
	
	this.moveHorizontal = function(des){
		for (var i = 0; i < vert.length; i ++)
			vert[i][0] = (vert[i][0] * 1) + des * (moveSpeed / 50);
		draw();
	};
	
	/********************************************************************
	 * Function switching the zoom speede of the faces.                 *
	 * #parameters:                                                     *
	 *   percent (int): Value (0-100) of speed.                         *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.setZoomSpeed = function(percent){
		if (percent >= 0 && percent <= 10)
			zoomSpeed = ((percent * 0.8) / 10) + 0.01;
		else
			console.log("setZoomSpeed(" + percent + "); ERROR: Only values between 0 and 10 are allowed");
	}
	
	/********************************************************************
	 * Function that changes the scale variable, witch results in a     *
	 * zoom in or zoom out effect.                                      *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.zoom = function(val){
		scale = scale + val * scale * zoomSpeed;
		draw();
	};
	
	/********************************************************************
	 * Function that clears the arrays and the canvas. Use to unload a  *
	 * model.                                                           *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: public                                                  *
	 ********************************************************************/
	this.clear = function(){
		initArrays();
		clearCanvas();
	};
	
	/********************************************************************
	 * Function that turns a hex color code in RGB.                     *
	 * stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb    *
	 * #parameters:                                                     *
	 *   hex (string): color code, for example "#33ff99"                *
	 * #return: (Array) r, g, b, with their correspondent color.        *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
						g: parseInt(result[2], 16),
									b: parseInt(result[3], 16)
		} : null;
	};
	
	/********************************************************************
	 * Function that checks if a string is a valid hexadecimal color    *
	 * code, in the format '#ffffff' or '#fff'                          *
	 * #parameters:                                                     *
	 *   code (string): Code to check.                                  *
	 * #return: (Boolean) True if valid color code, false otherwise.    *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var isColor = function(code){
		if (code[0] != '#')
			return false;
		if (code.length != 4 && code.length != 7)
			return false
		for (var i = 1; i < code.length; i ++)
			if (code[i] < '0' || (code[i] > 9 && code[i] < 'A') || (code[i] > 'Z' && code[i] < 'a') || code[i] > 'z')
				return false;
			return true;	
	};
	
	/********************************************************************
	 * Function that clears the canvas and gets it ready to draw on it. *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/
	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (dBackg)
			ctx.fillStyle = backColor;
		else
			ctx.fillStyle = "#ffffff";
		ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	};
	
	/********************************************************************
	 * Function initializing the arrays obj, vert and face as empty     *
	 * arrays.                                                          *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var initArrays = function(){
		material = null;
		vert = null;
		face = null;
		material = new Array();
		vert = new Array();
		face = new Array();
	};
	
	/********************************************************************
	 * Function tat populates the vert[] array with and array of three  *
	 * elements, containig the coordinates, and the face[] array with   *
	 * the vertices forming the face, plus one element indicating the   *
	 * codename of the material.                                        *
	 * #parameters:                                                     *
	 *   text (string): the content of the obj file.                    *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var readFile = function(text){
		var line;
		var v = 0;
		var f = 0;
		var m = 0;
		var max = 0;
		var j;
		var dist;
		var fac;
		var mat = "null";
		text = text + "\n";
		while (text.indexOf("\n") != -1){
			line = text.substring(0, text.indexOf("\n"));
			if (line.substring(0, 2) == "v "){
				vert[v] = new Array(3);
				line = line.substring(2);
				vert[v][0] = line.substring(0, line.indexOf(" "));
				line = line.substring(line.indexOf(" ") + 1);
				vert[v][1] = line.substring(0, line.indexOf(" "));
				line = line.substring(line.indexOf(" ") + 1);
				vert[v][2] = line;
				
				dist = Math.sqrt(vert[v][0] * vert[v][0] + vert[v][1] * vert[v][1] + vert[v][2] * vert[v][2]);
				if (dist > max)
					max = dist;
				v = v + 1;
			}
			else if (line.substring(0,2) == "f "){
				line = line.substring(2);
				face[f] = new Array();
				j = 0;
				while(line.indexOf(" ") != -1){
					face[f][j] = line.substring(0, line.indexOf(" "));
					if (face[f][j].indexOf('/') != -1)
						face[f][j] = face[f][j].substring(0, face[f][j].indexOf('/'));
					face[f][j] = face[f][j] - 1;
					line = line.substring(line.indexOf(" ") + 1);
					j = j + 1;
				}
				face[f][j] = line;
				if (face[f][j].indexOf('/') != -1)
					face[f][j] = face[f][j].substring(0, face[f][j].indexOf('/'));
				face[f][j] = face[f][j] - 1;
				face[f][j + 1] = mat;
				f = f + 1;
			}
			else if (line.substring(0, 6) == "usemtl"){
				mat = line.substring(7);
			}
			text = text.substring(text.indexOf("\n") + 1);
		}
		scale = calculateScale(max);
		totalVert = vert.length;
		totalFace = face.length;
	};
	
	/********************************************************************
	 * Function tat populates the material[] array with an array        *
	 * containig, four values: the material name, and the three RGB     *
	 * values.                                                          *
	 * #parameters:                                                     *
	 *   text (string): the content of the mtl file.                    *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var readMtlFile = function(text){
		text = text + "\n";
		i = -1;
		while (text.indexOf("\n") != -1){
			line = text.substring(0, text.indexOf("\n"));
			if (line.substring(0, 6) == "newmtl"){
				i = i + 1;
				material[i] = new Array(4);
				material[i][0] = line.substring(line.indexOf(" ") + 1);
			}
			//Kd, ddifuse color, usefull
			//Ka, ambient color, not now
			//Ks, specular color, not now
			//d or TR, transparency, not now
			else if (line.substring(0, 3) == "Kd "){
				line = line.substring(3);
				material[i][1] = line.substring(0, line.indexOf(" "));
				line = line.substring(line.indexOf(" ") + 1);
				material[i][2] = line.substring(0, line.indexOf(" "));
				line = line.substring(line.indexOf(" ") + 1);
				material[i][3] = line;
			}
			text = text.substring(text.indexOf("\n") + 1);
		}
		totalMaterial = material.length;
		if (totalMaterial == 0)
			hasMtl = false;
	};
	
	/********************************************************************
	 * Function that automatically calculates the best scale for the    *
	 * modelermined number of elements, containing the verices that     *
	 * form a face, so the bigest dimension from the object can fit in  *
	 * the smallest dimension of the canvas.                            *
	 * #parameters:                                                     *
	 *   text (int): the farthest vertex, from the center.              *
	 * #return: (int) The scale to be aplied.                           *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var calculateScale = function(max){
		var dim;
		if (canvas.width < canvas.height)
			dim = canvas.width;
		else
			dim = canvas.height;
		var sc = Math.round((0.95 * dim) / (2 * max));
		return sc;
	};
	
	/********************************************************************
	 * Function that compares the average Z coordinate of two faces.    *
	 * Must be used when sorting the face array.                        *
	 * #parameters:                                                     *
	 *   a (Array): One face.                                           *
	 *   b (Array): The other face.                                     *
	 * #return: (int) -1, 1 or 0.                                       *
	 * #scope: private                                                  *
	 ********************************************************************/ 
	var faceComparator = function(a,b){
		var aZ;
		var bZ;
		var i = 0;
		var sum = 0.0;
		while (i < a.length - 1){
			sum = sum + parseFloat(vert[a[i]][2]);
			i = i + 1;
		}
		aZ = sum / parseFloat(i);
		i = 0;
		sum = 0;
		while (i < b.length - 1){
			sum = sum + parseFloat(1 * vert[b[i]][2]);
			i = i + 1;
		}
		bZ = sum / parseFloat(i);
		if (aZ < bZ) return -1;
		if (aZ > bZ) return 1;
		return 0;
	};
	
	/********************************************************************
	 * Function that writes text in the corner of the canvas. Must be   *
	 * called when everithing has been drawn.                           *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/
	var writeCredits = function(){
		ctx.fillStyle = textColor;
		ctx.font = "12px Arial";
		var h = canvas.height / 2 - 14;
		var w = 10 - (canvas.width / 2);
		ctx.fillText("ObJS:   " + totalVert + " vertices   " + totalFace + " faces   " + totalMaterial + " materials", w, h);
	};
	
	/********************************************************************
	 * Function that draws th vertices, faces and edges in the canvas.  *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/
	var draw = function(){
		face = face.sort(faceComparator).reverse();
		clearCanvas();
		for (var i = 0; i < face.length; i++){
			ctx.strokeStyle = edgeColor;
			ctx.fillStyle = vertColor;
			ctx.beginPath();
			ctx.moveTo(scale * vert[face[i][0]][0], scale * vert[face[i][0]][1]);
			for (var j = 1; j < face[i].length - 1; j++) {
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
			if (useMtl){
				//Get material with the same name as the one in the last element of the face
				j = 0;
				while (material[j][0] != face[i][face[i].length - 1] && j < material.length)
					j = j + 1;
				if (material[j][0] == face[i][face[i].length - 1])
					ctx.fillStyle = "rgba(" + Math.round(255 * material[j][1]) + ", " + Math.round(255 * material[j][2]) + ", " + Math.round(255 * material[j][3]) + ", " + faceAlpha + ")";
				else
					ctx.fillStyle = faceColor;
			}
			else
				ctx.fillStyle = faceColor;
			if(dFaces)
				ctx.fill();
		}
		writeCredits();
	};
	
	/********************************************************************
	 * TODO: Function used when something in the canvas is clicked.     *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: private                                                  *
	 ********************************************************************/
	var mouseClick = function(){
	};
	
	thisObJS = this;
	return this;
}





