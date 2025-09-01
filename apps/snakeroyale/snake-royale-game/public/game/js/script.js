var canvas = document.getElementById("canvasSnake");
var ctxSnake = document.getElementById("canvasSnake").getContext("2d");
var ctxFood = document.getElementById("canvasFood").getContext("2d");
var ctxHex = document.getElementById("canvasHex").getContext("2d");
var ut = new Util();
var mouseDown = false,
	cursor = new Point(0, 0);
var game = new Game(ctxSnake, ctxFood, ctxHex);

function resize() {
    // Match drawing buffer to viewport size for all layers
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvases = [
        document.getElementById("canvasSnake"),
        document.getElementById("canvasFood"),
        document.getElementById("canvasHex"),
    ];

    canvases.forEach((c) => {
        if (!c) return;
        c.width = width;
        c.height = height;
    });

    // Update logical screen size
    if (game && game.SCREEN_SIZE) {
        const oldCenter = new Point(game.SCREEN_SIZE.x / 2, game.SCREEN_SIZE.y / 2);
        game.SCREEN_SIZE.x = width;
        game.SCREEN_SIZE.y = height;

        // Recenter the local player to the new screen center
        if (game.snakes && game.snakes.length > 0) {
            const player = game.snakes[0];
            if (player && player.arr && player.arr.length > 0) {
                const head = player.arr[0];
                const newCenter = new Point(width / 2, height / 2);
                const dx = newCenter.x - head.x;
                const dy = newCenter.y - head.y;

                // Shift entire snake so head is centered
                for (let i = 0; i < player.arr.length; i++) {
                    player.arr[i].x += dx;
                    player.arr[i].y += dy;
                }
                player.pos.x += dx;
                player.pos.y += dy;
            }
        }
    }
}

canvas.onmousemove = function(e){
	if(mouseDown){		
		cursor = ut.getMousePos(canvas, e);	
		var ang = ut.getAngle(game.snakes[0].arr[0], cursor);				
		game.snakes[0].changeAngle(ang);		
	}
}

canvas.onmousedown = function(e){
	mouseDown = true;	
}

canvas.onmouseup = function(e){	
	mouseDown = false;
}

function start(){	
    resize();
	game.init();
	update();
}


var updateId,	
previousDelta = 0,
fpsLimit = 20;
function update(currentDelta){
	updateId = requestAnimationFrame(update);
	var delta = currentDelta - previousDelta;
    if (fpsLimit && delta < 1000 / fpsLimit) return;
    previousDelta = currentDelta;

    //clear all
	ctxFood.clearRect(0, 0, canvas.width, canvas.height);
	ctxSnake.clearRect(0, 0, canvas.width, canvas.height);
	ctxHex.clearRect(0, 0, canvas.width, canvas.height);

	//draw all
	game.draw();	
}


window.addEventListener('resize', resize);

start();






