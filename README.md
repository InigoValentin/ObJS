ObJS
====

## A 3D Wavefront obj file viewer for HTML5 written in JavaScript ###

<a href="http://imgur.com/MIfKkHG"><img src="http://i.imgur.com/MIfKkHG.png" title="ObJS - Seaplane" /></a>


### Live demo ###

<a href="http://seavenois.com/jstricks/ObJS/">http://seavenois.com/jstricks/ObJS/</a>



### Features ###

* Object rotation.
* Zoom in and out.
* Object movement.
* Mouse and touch control.
* Choose to draw (or not) vertizes, edges or faces.
* Use mtl files for material color.
* Change colors of background, vertizes, edges, and faces during runtime.
* Change face transparency during runtime, so hidden elements are visible.
* Change zoom and rotation speed during runtime.



### How to use ###

Just include the *ObJS.js* in your project, create a ObJS object, and initalize its canvas.
```javascript
myObJS = new ObJS();
myObJS.initCanvas(canvas);
```
* *canvas* is the canvas element in witch the model will be represented. If this parameter is not specified, the script will try to use a canvas called *ObJSCanvas*.

Then you can load any obj model by calling
```javascript
myObJS.load(file);
```
* *file* is a character string with the path to the file, relative or absolute.


If you want to clear the canvas, just call
```javascript
myObJS.clear();
```
Note that the canvas is automatically cleared when a new object is loaded.



### Transformations ###


##### Rotate the object #####

You can rotate the object by dragging it with the mouse or your finger in a touch screen. Also, you can apply rotation programatically:

```javascript
myObJS.rotateX(-1); //Rotate along the X edge to the left
myObJS.rotateX(1);  //Rotate along the X edge to the right
myObJS.rotateY(-1); //Rotate along the Y edge to the left
myObJS.rotateY(1);  //Rotate along the Y edge to the right
```
Note that the rotation speed can be set (see *Set rotation speed*).


##### Move the object #####

You can move the object around by dragging it with the mouse while holding down the *shift* key. Also, you can move it programatically:

```javascript
myObJS.moveHorizontal(-1); //Move to the left
myObJS.moveHorizontal(1);  //Move right
myObJS.moveVertical(-1);   //Move up
myObJS.moveVertical(1);    //Move down
```
Note that the movement speed can be set (see *Set movement speed*).


##### Zoom #####

Zoom in and out can be achieven with the mouse wheel, by pinching the mode if you are using a touch screen, or programatically:

```javascript
myObJS.zoom(value);
```
*value* can be any float number, positive to zoom in, and negative to zoom out. *1* and *-1* are a one step zoom in or out. 
Note that the zoom speed can be set (see *Set zoom speed*).



### Customization ###

You can change parameters such as the elements to draw, their color, transparency, rotation speed, zoom speed... in the script, but much of them can be changed on runtime, so you can use controls.


##### Select which elements to draw #####
```javascript
myObJS.drawVertizes(true);    //Draw vertizes
myObJS.drawVertizes(false);   //Don't draw vertizes

myObJS.drawEdges(true);       //Draw edges
myObJS.drawEdges(false);      //Don't draw edges

myObJS.drawFaces(true);       //Draw faces
myObJS.drawFaces(false);      //Don't draw faces

myObJS.drawBackground(true);  //Draw the background
myObJS.drawBackground(false); //Don't draw the background
```


##### Select color for elements #####
```javascript
myObJS.setVertizesColor(code);   //Set the color for the vertizes

myObJS.setEdgesColor(code);      //Set the color for the edges

myObJS.setFacesColor(code);      //Set the color for the faces

myObJS.setBackgroundColor(code); //Set the background color
```
* *color* is a hexadecimal triplet with the color code, including the number sign ('#'), and three or six hexadecimal characters. Valid examples are:
	- *'#ff0000'*  for <span style="color:#ff0000">red</span>.
	- *'#f00'* also for <span style="color:#ff0000">red</span>.
	- *'#FF8600'*, for <span style="color:#FF8600">orange</span>.
	- *'#DDFFDD'*, for <span style="color:#AAFFAA">light green</span>.


##### Use materials #####

If a .mtl file is present in the same directory as the obj file, you can use the materials there to colorize the model (enabled by default). 
```javascript
myObJS.linkMaterial(true); //Use .mtl file
myObJS.linkMaterial(false); //Don't use .mtl file
```
Note that, when using .mtl files, faces with no material assigned will use the color defined by the user.


##### Select face transparency #####
```javascript
myObJS.setAlpha(percent);
```
* *percent* is an integer, between 0 and 100, indicating the level of transparency you want to apply to the faces.


##### Set rotation speed #####
```javascript
myObJS.setRotationSpeed(value);
```
* *value* is an integer, between 0 and 10. The greater it is, the greater the rotation speed.


##### Set movement speed #####
```javascript
myObJS.setMovementSpeed(value);
```
* *value* is an integer, between 0 and 10. The greater it is, the greater the movement speed.


##### Set zoom speed #####
```javascript
myObJS.setZoomSpeed(value);
```
* *value* is an integer, between 0 and 10. The greater it is, the greater the zoom speed.