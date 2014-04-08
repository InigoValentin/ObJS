var backColor = "rgba(200, 200, 200, 255)";
var vertColor = "rgba(10, 10, 10, 255)";
var edgeColor = "rgba(200, 0, 0, 255)";
var faceColor = "rgba(180, 180, 255, 200)";
var textColor = "rgba(0, 0, 0, 255)";
var vertSize = 5;

var mDown = false;

var canvas;
var ctx;

function loadModel(val){
	//Get file
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/obj/" + val.value + ".obj", false);
	xmlhttp.send();
	var fileContent = xmlhttp.responseText;
	
	initCanvas();
	writeCredits();
}

function initCanvas(){
	canvas = document.getElementById("ObJSCanvas");
	ctx = canvas.getContext("2d");
	
	ctx.fillStyle = backColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	
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

function mouseClick(){
	//TODO: Element clicked
}

function writeCredits(){
	ctx.fillStyle = textColor;
	ctx.font = "12px Arial";
	var h = canvas.height - 14;
	var w = canvas.width - 45;
	ctx.fillText("ObJS", w, h);
}
