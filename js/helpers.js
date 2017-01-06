function endGameLose() {
    if ( ! endGame) {
        alert('you lose');
    }

    game.endGameParade();

    endGame = true;
}



function endGameWin() {
    if ( ! endGame) {
        alert('you win');
    }

    game.endGameParade();

    endGame = true;
}



/**	
 * Check if to axis aligned bounding boxes intersects
 *
 * @return {bool}  the check result
 */
function hasCollision(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx+bw 
	       && 
	       bx < ax+aw 
	       &&
	       ay < by+bh
	       &&
	       by < ay+ah;
};



/**
 * Bullet class 
 * 
 * @param {number} x     start x position
 * @param {number} y     start y position
 * @param {number} vel   velocity in y direction
 * @param {number} w     width of the bullet in pixels
 * @param {number} h     height of the bullet in pixels
 * @param {string} color hex-color of bullet
 * @param {string} from  who shot the bullet "alien" or "tank"
 */
function Bullet(x, y, vel, w, h, color, from) {
	this.x      = x;
	this.y      = y;
	this.vel    = vel;
	this.width  = w;
	this.height = h;
	this.color  = color;
	this.from   = from;
};

/**
 * Update bullet position
 */
Bullet.prototype.update = function() {
	this.y += this.vel;
};


/**
 * Abstracted canvas class usefull in games
 * 
 * @param {number} width  width of canvas in pixels
 * @param {number} height height of canvas in pixels
 */
function Game(width, height) {
	// create canvas and grab 2d context
	this.canvas = document.createElement("canvas");

	this.canvas.width  = this.width = width;
	this.canvas.height = this.height = height;

	this.ctx = this.canvas.getContext("2d");

	// append canvas to body of document
	document.body.appendChild(this.canvas);
};

/**
 * Clear the complete canvas
 */
Game.prototype.clear = function() {
	this.ctx.clearRect(
	    0,
	    0,
	    this.width,
	    this.height
	);
};

/**
 * Draw a sprite instance to the canvas
 * 
 * @param  {Sprite} sp the sprite to draw
 * @param  {number} x  x-coordinate to draw sprite
 * @param  {number} y  y-coordinate to draw sprite
 */
Game.prototype.drawSprite = function(sp, x, y) {
	// draw part of spritesheet to canvas
	this.ctx.drawImage(
	    sp.img,
	    sp.x,
	    sp.y,
	    sp.w,
	    sp.h,
	    x,
	    y,
	    sp.w,
	    sp.h
	);
};

/**
 * Draw a bullet instance to the canvas
 * @param  {Bullet} bullet the bullet to draw
 */
Game.prototype.drawBullet = function(bullet) {
	// set the current fillstyle and draw bullet
	this.ctx.fillStyle = bullet.color;
	this.ctx.fillRect(
	    bullet.x,
	    bullet.y,
	    bullet.width,
	    bullet.height
	);
};



Game.prototype.endGameParade = function() {
}


/**
 * Sprite object, uses sheet image for compressed space
 * 
 * @param {Image}  img sheet image
 * @param {number} x   start x on image
 * @param {number} y   start y on image
 * @param {number} w   width of asset
 * @param {number} h   height of asset
 */
function Sprite(img, x, y, w, h) {
	this.img = img;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};


/**
 * InputHandler class, handle and log pressed keys
 */
function InputHandler() {
	this.down = {};
	this.pressed = {};
	// capture key presses
	var that = this;
	document.addEventListener("keydown", function(evt) {
		that.down[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete that.down[evt.keyCode];
		delete that.pressed[evt.keyCode];
	});
};

/**
 * Returns whether a key is pressod down
 * @param  {number}  code the keycode to check
 * @return {bool}         the result from check
 */
InputHandler.prototype.isDown = function(code) {
	return this.down[code];
};

/**
 * Return wheter a key has been pressed
 * @param  {number}  code the keycode to check
 * @return {bool}         the result from check
 */
InputHandler.prototype.isPressed = function(code) {
	// if key is registred as pressed return false else if
	// key down for first time return true else return false
	if (this.pressed[code]) {
		return false;
	} 
	
	if (this.down[code]) {
		return this.pressed[code] = true;
	}

	return false;
};

