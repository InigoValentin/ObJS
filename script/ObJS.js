var backColor = "rgba(200, 200, 200, 1)";
var vertColor = "rgba(10, 10, 10, 1)";
var edgeColor = "rgba(200, 0, 0, 1)";
var faceColor = "rgba(180, 180, 255, .5)";
var textColor = "rgba(0, 0, 0, 1)";
var vertSize = 6; //Make it even
var scale = 50;

var mDown = false;

var canvas;
var ctx;

var obj;
var vert;
var face;

var pX = null;
var pY = null;

function loadModel(val){
	//Get file
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/obj/" + val.value + ".obj", false);
	xmlhttp.send();
	var fileContent = xmlhttp.responseText;
	initArrays();
	readVerts(fileContent);
	readFaces(fileContent);
	initCanvas();
	drawFaces();
	drawVerts();
	writeCredits();
}

function initArrays(){
	obj =  null;
	vert = null;
	face = null;
	obj =  new Array();
	vert = new Array();
	face = new Array();
}

function readVerts(text){
	var line;
	var i = 0;
	while (text.indexOf("v ") != -1){
		line = text.substring(text.indexOf("v "), text.indexOf("\n", text.indexOf("v ")));
		vert[i] = new Array(3);
		line = line.substring(2);
		vert[i][0] = scale * Math.round(line.substring(0, line.indexOf(" ")));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][1] = scale * Math.round(line.substring(0, line.indexOf(" ")));
		line = line.substring(line.indexOf(" ") + 1);
		vert[i][2] = scale * Math.round(line);
		i = i + 1;
		text = text.substring(text.indexOf("v ") + 1)
	}	
}

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

function drawFaces(){
	for (var i = 0; i < face.length; i++){
		ctx.fillStyle = edgeColor;
		ctx.beginPath();
		ctx.moveTo(vert[face[i][0]][0], vert[face[i][0]][1]);
		for (var j = 1; j < face[i].length; j++) {
			ctx.lineTo(vert[face[i][j]][0], vert[face[i][j]][1]);
			ctx.stroke();
		}
		ctx.closePath();
		ctx.fillStyle = faceColor;
		ctx.fill();
	}
}

function rotateY(theta) {
	var sin_t = Math.sin(theta / 100);
	var cos_t = Math.cos(theta / 100);
	
	for (var i=0; i<vert.length; i++) {
		var x = vert[i][0];
		var z = vert[i][2];
		vert[i][0] = x * cos_t - z * sin_t;
		vert[i][2] = z * cos_t + x * sin_t;
	}
};

function rotateX(theta) {
	var sin_t = Math.sin(theta / 100);
	var cos_t = Math.cos(theta / 100);
	
	for (var i=0; i<vert.length; i++) {
		var y = vert[i][1];
		var z = vert[i][2];
		vert[i][1] = y * cos_t - z * sin_t;
		vert[i][2] = z * cos_t + y * sin_t;
	}
};

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
			if(mDown) mouseClick(e);
			
			pX = null;
			pY = null;
			
			mDown = false;
		}
			
		canvas.onmousemove = function(e){
			if(!mDown) return;
			
			var x = e.offsetX==undefined?e.layerX:e.offsetX;
			var y = e.offsetY==undefined?e.layerY:e.offsetY;
			
			rotateY(x - pX);
			rotateX(y - pY);
			
			pX = x;
			pY = y;
			
			initCanvas();
			drawFaces();
			drawVerts();
			return false;
		}
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = backColor;
	ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
}

function mouseClick(){
	//TODO: Element clicked
}

function writeCredits(){
	ctx.fillStyle = textColor;
	ctx.font = "12px Arial";
	var h = canvas.height / 2 - 14;
	var w = canvas.width / 2 - 45;
	ctx.fillText("ObJS", w, h);
}
