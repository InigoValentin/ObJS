/********************************************************************
 * The ObJS objectnitializes the canvas, assignin it to the HTML    *
 * element, and set the required mouse events.                      *
 * #parameters: none                                                *
 * #return: nothing                                                 *
 ********************************************************************/
function ObJS(file, canv){
	
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
				thisObJS.rotateY(x - pX);
				thisObJS.rotateX(y - pY);
				pX = x;
				pY = y;
				draw();
				return false;
			};
			
			canvas.addEventListener('mousewheel',function(event){
				if (event.wheelDelta > 0)
					thisObJS.zoom("-");
				else 
					thisObJS.zoom("+");
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
		//Get obj file
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", file, false);
		xmlhttp.send();
		var fileContent = xmlhttp.responseText;
		//Get mtl file
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET",file.substring(0, file.lastIndexOf(".")) + ".mtl", false);
		console.log("GET" + file.substring(0, file.lastIndexOf(".")) + ".mtl");
		xmlhttp.send();
		var mtlContent = xmlhttp.responseText;
		initArrays();
		readFile(fileContent);
		readMtlFile(mtlContent);
		draw();
	};
	
	/********************************************************************
	 * Function switching the elements to draw (dVerts, dEdges, dFaces) *
	 * #parameters:                                                     *
	 *   name (string): key to the element to draw.                     *
	 *   value (boolean): indicating if the element is to be drawn.     *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.drawElement = function(name, value){
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
	 * Function switching the color of the elements.                    *
	 * #parameters:                                                     *
	 *   name (string): key to the element to colorize.                 *
	 *   value (boolean): indicating if the element is to be drawn.     *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/ 
	this.colorElement = function(name, value){
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
	 * Function that rotates elements in the canvas along the Y axis,   *
	 * calculating the new position for each vertex in the vert array.  *
	 * #parameters:                                                     *
	 *   des (int): mouse displacement from the last frame.             *
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
	};
	
	/********************************************************************
	 * Function that rotates elements in the canvas along the X axis,   *
	 * calculating the new position for each vertex in the vert array.  *
	 * #parameters:                                                     *
	 *   des (int): mouse displacement from the last frame.             *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
	 ********************************************************************/
	this.rotateX = function(des){
		for (var i = 0; i < vert.length; i ++) {
			var y = vert[i][1];
			var z = vert[i][2];
			vert[i][1] = y * Math.cos(des / rotationSpeed) - z * Math.sin(des / rotationSpeed);
			vert[i][2] = z * Math.cos(des / rotationSpeed) + y * Math.sin(des / rotationSpeed);
		}
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
	this.zoom = function(dir){
		if (dir == "-")
			scale = Math.round(scale * (1 + zoomSpeed));
		if (dir == "+")
			scale = Math.round(scale * (1 - zoomSpeed));
		draw();
	};
	
	this.clear = function(){
		initArrays();
		clearCanvas();
	}
	
	/********************************************************************
	 * Function that clears the canvas and gets it ready to draw on it. *
	 * #parameters: none                                                *
	 * #return: nothing                                                 *
	 * #scope: public                                                   *
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
	 * the vertizes forming the face, plus one element indicating the   *
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
					face[f][j] = line.substring(0, line.indexOf(" ")) - 1;
					line = line.substring(line.indexOf(" ") + 1);
					j = j + 1;
				}
				face[f][j] = line - 1;
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
		var w = 10 - (canvas.height / 2);
		ctx.fillText("ObJS:   " + totalVert + " vertizes   " + totalFace + " faces   " + totalMaterial + " materials", w, h);
	};
	
	/********************************************************************
	 * Function that draws th vertizes, faces and edges in the canvas.  *
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





