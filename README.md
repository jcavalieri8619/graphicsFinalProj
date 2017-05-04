# graphicsFinalProj
implemented using THREEjs--my code is in js/main.js

operations on the roundedBox use constructive solid geometry and its a computationally expensive 
process--so give it a second if you modify the roundedBox. It will appear to freeze but its
just computing.

To build a TriangleMesh--click captureMouseClicks then as you click the screen,
red spheres will show up (approximately) where you clicked. After 3+ clicks, 
click drawMesh to see the resulting mesh with spheres union'ed with each face of the mesh,
again, using CSG.  Be sure to space your clicks our far enough because I've had issues with 
extremely thin meshes where the spheres poke through to opposite face. If you can't see the red
spheres showing up then zoom out a bit using mouse wheel.

If you click TravelCircles, the the currently rendered objects will travel in circles but 
I'm having issues where if you also rotate the objects then the camera doesn't exactly follow
the objects so the objects will travel out of the field of view and back in periodically. 

takes a minute to load because there is a high-res image in background.

link: http://www.cs.uml.edu/~jcavalie/427546s2017/prog-hws/5/


![alt text](https://github.com/jcavalieri8619/graphicsFinalProj/blob/master/graphics_1.png)




![alt text](https://github.com/jcavalieri8619/graphicsFinalProj/blob/master/graphics_3.png)
