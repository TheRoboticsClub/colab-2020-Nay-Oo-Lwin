var mapCanvas = document.getElementById("birds-eye"),
    ctx = mapCanvas.getContext("2d");

mapCanvas.addEventListener("click",destinationPicker);

function destinationPicker(event){
       
           cursorX = event.clientX - mapCanvas.offsetLeft;
           cursorY = event.clientY - mapCanvas.offsetTop ;
           //document.getElementById('x-value').textContent = cursorX;
           //document.getElementById('y-value').textContent = cursorY;
	   ctx.beginPath();
           ctx.strokeStyle = "#0000FF";

           ctx.moveTo((cursorX - 8) * 0.66556, (cursorY - 8) * 0.342);
           ctx.lineTo((cursorX + 8) * 0.66556, (cursorY + 8) * 0.342);

           ctx.moveTo((cursorX + 8) * 0.66556, (cursorY - 8) * 0.342);
           ctx.lineTo((cursorX - 8) * 0.66556, (cursorY + 8) * 0.342);
           ctx.stroke();
	   ctx.closePath();
           return [cursorX,cursorY];
	   
}

function generatepath(){
        
        var data = [
            [
              [
                6.87462062085475,
                45.9746815056445,
                2494.80004882813
              ],
              [
                6.87473799526779,
                45.9772917433492,
                2517.48754882813
              ]
            ]
          ];
        
        var minx,miny,maxx,maxy;
        miny = minx = Infinity
        maxx = maxy = -Infinity;
        data.forEach(dat => {
          dat.forEach(point => {
              minx = Math.min(minx,point[0]);
              miny = Math.min(miny,point[1]);
              maxx = Math.max(maxx,point[0]);
              maxy = Math.max(maxy,point[1]);
           });
        });
       var rangeX = maxx - minx;
       var rangeY = maxy - miny;
       var range = Math.max(rangeX,rangeY);
       var scale = Math.min(mapCanvas.width,mapCanvas.height);
       
       data.forEach(dat => {
          ctx.beginPath();
          ctx.strokeStyle = "#008000";
          dat.forEach(point => {
              var x = point[0];
              var y = point[1];
              x = ((x-minx) / range) * scale;
              y = ((y-miny) / range) * scale;
              ctx.lineTo(x,y);
           });
           ctx.stroke();
        });
}

//function hey(event){
//        document.getElementById('x-value').textContent = event.offsetX;
//        document.getElementById('y-value').textContent = event.offsetY;
//}
