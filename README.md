ObJS
====

## A .obj files viewer for HTML5 written in JavaScript ###

<a href="http://imgur.com/S2p04Pr"><img src="http://i.imgur.com/S2p04Pr.png" title="ObJS - bolt" /></a>



### Features ###

* Object rotation with the mouse.
* Zoom control with the mousewheel.
* Choose to draw (or not) vertizes, edges or faces.
* Change colors of background, vertizes, edges, and faces during runtime.
* Change face transparency during runtime, so hidden elements are visible.



### How to use ###

Just include the *ObJS.js* in your project, and call
```javascript
loadModel(file, canvas);
```
Where 
* *file* is a character string with the path to the file, relative or absolute.
* *canvas* is the canvas element in witch the model will be represented. If this parameter is not specified, the script will try to use a canvas called *ObJSCanvas*.



### Customization ###

You can change parameters such as the elements to draw, their color, transparency, rotation speed, zoom speed... in the script, but much of them can be changed on runtime, so you can use controls.

##### Select which elements to draw #####
```javascript
drawElement(keyword, on);
```
Where
* *keyword* is a character string indicating witch element you want or don't want to be drawn. Possible values are
	- *'backg'*, for the background.
	- *'verts'*, for the vertizes.
	- *'edges'*, for the edges.
	- *'faces'*, for the faces.
* *on* is a Boolean value, indicating if the element is to be drawn or not.

##### Select color for elements #####
```javascript
colorElement(keyword, color);
```
Where
* *keyword* is a character string indicating witch element you want to colorize. Possible values are
	- *'backg'*, for the background.
	- *'verts'*, for the vertizes.
	- *'edges'*, for the edges.
	- *'faces'*, for the faces.
* *color* is a character string with the HEX codeo for the desired color, for example *'#ff0000'* for red.

##### Select face transparency #####
```javascript
setAlpha(percent);
```
Where
* *percent* is an integer, between 0 and 100, indicating the level of transparency you want to apply to the faces.