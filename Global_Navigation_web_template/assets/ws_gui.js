// Set the src of iframe tag
//document.getElementById("gzweb").setAttribute(
//	"src", "http://" + websocket_address + ":8080")

// To decode the image string we will receive from server
function decode_utf8(s){
    return decodeURIComponent(escape(s))
}

// Websocket and other variables for image display
var websocket_gui;
function declare_gui(websocket_address){
	websocket_gui = new WebSocket("ws://" + websocket_address + ":2303/");

	websocket_gui.onopen = function(event){
		alert("[open] Connection established!");
	}
	
	websocket_gui.onclose = function(event){
		if(event.wasClean){
			alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		}
		else{
			alert("[close] Connection closed!");
		}
	}

	// What to do when a message from server is received
	websocket_gui.onmessage = function(event){
		var operation = event.data.substring(0, 4);
           
		if(operation == "#gui"){
			// Parse the entire Object
			var data = JSON.parse(event.data.substring(4, ));
                        //Parse array data and call generathPath function
                        var array = JSON.parse(data.array);
                        generatePath(array);
                        //Parse encoded image data and decode it
                        var image_data = JSON.parse(data.image),
				source = decode_utf8(image_data.image),
				shape = image_data.shape;
			
			if(source != ""){
				image.src = "data:image/png;base64," + source;
				canvas.width = shape[1];
				canvas.height = shape[0];
			}
                 
                        // Parse the Map data
			// Slice off ( and )
			var pose = data.map.substring(1, data.map.length - 1);
			var content = pose.split(',').map(function(item) {
				return parseFloat(item);
			})
			draw(content[0], content[1], content[2], content[3]);
			// Parse the Console messages
                        //console.log(data.text_buffer);
                        text = data.text_buffer
                        if(text.substring(1,2) == "("){
                             text = text.replace("(","[");
                             text = text.replace(")","]");
                             console.log(text)
                        }
         
			messages = JSON.parse(text);
			// Loop through the messages and print them on the console
			for(message of messages){
				// Set value of command
				command.value = message
				// Go to next command line
				next_command()
			}


			// Send the Acknowledgment Message
			websocket_gui.send("#ack");
		}
		
		else if(operation == "#cor"){
			// Set the value of command
			var command_input = event.data.substring(4, );
			command.value = command_input;
			// Go to next command line
			next_command();
			// Focus on the next line
			command.focus();
		}
         	
	}
}

//function to send the mouse click data 
function pickLoc(){
        var data = destinationPicker(event);
        coords = {"data" : data};
        websocket_gui.send("#pick" + JSON.stringify(coords));
}

var canvas = document.getElementById("gui_canvas"),
    context = canvas.getContext('2d');
    image = new Image();
    
// Lap time DOM
// var lap_time_display = document.getElementById("lap_time");

// For image object
image.onload = function(){
   update_image();
}

// Request Animation Frame to remove the flickers
function update_image(){
 	window.requestAnimationFrame(update_image);
 	context.drawImage(image, 0, 0);
}
