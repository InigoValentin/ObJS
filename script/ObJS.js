var backColor = "rgba(200, 200, 200, 255)";
var vertColor = "rgba(10, 10, 10, 255)";
var edgeColor = "rgba(200, 0, 0, 255)";
var faceColor = "rgba(180, 180, 255, 200)";
var textColor = "rgba(0, 0, 0, 255)";
var vertSize = 6; //Make it even
var scale = 50;

var mDown = false;

var canvas;
var ctx;

var obj;
var vert;
var face;

function loadModel(val){
	//Get file
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/obj/" + val.value + ".obj", false);
	xmlhttp.send();
	var fileContent = xmlhttp.responseText;
	initArrays();
	readObj(fileContent);
	initCanvas();
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

function readObj(text){
	var finish = false;
	var line;
	var i = 0;
	while (!finish){
		if (text.indexOf("v ") == -1)
			finish = true;
		else{
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
}

function drawVerts(){
	ctx.fillStyle = vertColor;
	var x;
	var y;
	var w;
	var h;
	console.log("Drawing " + vert.length + " verts");
	for (var i = 0; i < vert.length; i++) {
		x = vert[i][0] - (vertSize / 2);
		w = vertSize;
		y = vert[i][1] - (vertSize / 2);
		h = vertSize;
		//console.log("vert[" + i + "] x: " + vert[i][0] + " y: " + vert[i][1] + " z: " + vert[i][2])
		//ctx.arc(vert[i][0], vert[i][1], vertSize, 0, 2 * Math.PI, false);
		//console.log(x + ", " + y + ", " + w + ", " + h)
		ctx.fillRect(x, y, w, h);
		console.log("Drawed vert " + i);
	}
}

function initCanvas(){
	if (canvas == null){
		console.log("INIT");
		canvas = document.getElementById("ObJSCanvas");
		ctx = canvas.getContext("2d");
		ctx.translate(canvas.width / 2, canvas.height / 2);
		
		canvas.onmousedown = function(e){
			
			mDown = true;
		}
			
		canvas.onmouseup = function(e){
			if(mDown) mouseClick(e);
			
			mDown = false;
		}
			
		canvas.onmousemove = function(e){
			if(!mDown) return;
			
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
	console.log("CREDITS");
	ctx.fillStyle = textColor;
	ctx.font = "12px Arial";
	var h = canvas.height / 2 - 14;
	var w = canvas.width / 2 - 45;
	ctx.fillText("ObJS", w, h);
}
