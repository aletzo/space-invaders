var

/**
 * Game objects
 */
game,
input,
frames,

spFrame,
lvFrame,

alSprite,

aliens,
dir,
tank,
bullets,
cities,

endGame,

citiesLimit,
maxAliensY;

/**
 * Initiate and start the game
 */
function main() {
	// create game canvas and inputhandler
	game = new Game(504, 600);
	input = new InputHandler();

	// create all sprites fram assets image
	var img = new Image();
	img.addEventListener("load", function() {

		alSprite = [
			[new Sprite(this,  0, 0, 22, 16), new Sprite(this,  0, 16, 22, 16)],
			[new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
			[new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
		];

		// initate and run the game
		init();
		run();
	});

	img.src = "img/invaders.png";
};

/**
 * Initialize game objects
 */
function init() {
	// set start settings
	frames  = 0;
	spFrame = 0;
	lvFrame = 60;

    endGame = false;

	maxAliensY = 0;

	dir = 1;

	// create the tank object
	tank = {
		canvas: null,
		ctx: 	null,

		x: (game.width - 100) / 2,
		y: game.height - 30,
		w: 80,
		h: 20,

		init: function() {
			this.canvas = document.createElement("canvas");
			this.canvas.width = this.w;
			this.canvas.height = this.h;
			this.ctx = this.canvas.getContext("2d");

            this.ctx.font = "11pt Sans-Serif";
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 0.1;
            
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillRect(
                this.x,
                this.y,
                this.w,
                this.h
            );
                

            this.ctx.fillStyle = "#fff";
            this.ctx.fillText(
                "developer",
                0,
                13
            );
		}
	};

	tank.init();


	// initatie bullet array
	bullets = [];

	// create the cities object (and canvas)
	cities = {
		canvas: null,
		ctx: 	null,

		y: tank.y - 50,
		w: 70,
		h: 22,


		/**
		 * Create canvas and game graphic context
		 */
		init: function() {
			// create canvas and grab 2d context
			this.canvas = document.createElement("canvas");
			this.canvas.width = game.width;
			this.canvas.height = this.h;
			this.ctx = this.canvas.getContext("2d");

            this.ctx.font = "18pt Sans-Serif";
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 0.1;

            for (var i = 0; i < 4; i++) {
                //this.ctx.fillStyle = "#ffcc00";
                //this.ctx.strokeRect(30, 0 + (i * 50), 50, 50);
                this.ctx.fillStyle = "#fff";
                this.ctx.fillText(
                    "code",
                    this.w + (i * 90),
                    this.h - 5
                );
            }
		},

		/**
		 * Create damage effect on city-canvas
		 * 
		 * @param  {number} x x-coordinate
		 * @param  {number} y y-coordinate
		 */
		generateDamage: function(x, y) {
			// round x, y position
			x = Math.floor(x/2) * 2;
			y = Math.floor(y/2) * 2;
			// draw dagame effect to canvas
			this.ctx.clearRect(x-2, y-2, 4, 4);
			this.ctx.clearRect(x+2, y-4, 2, 4);
			this.ctx.clearRect(x+4, y, 2, 2);
			this.ctx.clearRect(x+2, y+2, 2, 2);
			this.ctx.clearRect(x-4, y+2, 2, 2);
			this.ctx.clearRect(x-6, y, 2, 2);
			this.ctx.clearRect(x-4, y-4, 2, 2);
			this.ctx.clearRect(x-2, y-6, 2, 2);
		},

		/**
		 * Check if pixel at (x, y) is opaque
		 * 
		 * @param  {number} x x-coordinate
		 * @param  {number} y y-coordinate
		 * @return {bool}     boolean value if pixel opaque
		 */
		hits: function(x, y) {
			// transform y value to local coordinate system
			y -= this.y;
			// get imagedata and check if opaque
			var data = this.ctx.getImageData(x, y, 1, 1);

			if (data.data[3] !== 0) {
				this.generateDamage(x, y);
				return true;
			}

			return false;
		}
	};

	cities.init(); // initiate the cities

	citiesLimit = cities.y;

	// create and populate alien array
	aliens = [];
	var rows = [1, 0, 0, 2, 2];
	for (var i = 0, len = rows.length; i < len; i++) {
		for (var j = 0; j < 10; j++) {
			var a = rows[i];
			// create right offseted alien and push to alien
			// array
			aliens.push({
				sprite: alSprite[a],
				x: 30 + j*30 + [0, 4, 0][a],
				y: 30 + i*30,
				w: alSprite[a][0].w,
				h: alSprite[a][0].h
			});
		}
	}
};

/**
 * Wrapper around the game loop function, updates and renders
 * the game
 */
function run() {
	var loop = function() {
		update();
		render();

		window.requestAnimationFrame(loop, game.canvas);
	};

	window.requestAnimationFrame(loop, game.canvas);
};

/**
 * Update the game logic
 */
function update() {
	// update the frame count
	frames++;

	// update tank position depending on pressed keys
	if (input.isDown(37)) { // Left
		tank.x -= 4;
	}
	if (input.isDown(39)) { // Right
		tank.x += 4;
	}
	// keep the tank sprite inside of the canvas
	tank.x = Math.max(Math.min(tank.x, game.width - tank.w), 30);

	// append new bullet to the bullet array if spacebar is
	// pressed
	if (input.isPressed(32)) { // Space
		var newBullet = new Bullet(
		    tank.x + tank.w / 2,
		    tank.y,
		    -4,
		    2,
		    4,
		    '#fff',
		    'tank'
		);

		bullets.push(newBullet);
	}

	// update all bullets position and checks
	for (var i = 0, len = bullets.length; i < len; i++) {
		var b = bullets[i];
		b.update();
		// remove bullets outside of the canvas
		if (b.y + b.height < 0 || b.y > game.height) {
			bullets.splice(i, 1);
			i--;
			len--;
			continue;
		}
		// check if bullet hits any city
		var h2 = b.height * 0.5; // half hight is used for
								 // simplicity
		if (cities.y < b.y+h2 && b.y+h2 < cities.y + cities.h) {
			if (cities.hits(b.x, b.y+h2)) {
				bullets.splice(i, 1);
				i--;
				len--;
				continue;
			}
		}

		if (b.from === 'tank') {
		    // check if the bullet hits any alien
		    for (var j = 0, len2 = aliens.length; j < len2; j++) {

			    var a = aliens[j];

			    var collision = hasCollision(
			        b.x,
			        b.y,
			        b.width,
			        b.height,
			        a.x,
			        a.y,
			        a.w,
			        a.h
			    );

			    if (collision) {
				    aliens.splice(j, 1);

                    if ( ! aliens.length) {
                        endGameWin();
                    }

				    j--;
				    len2--;
				    bullets.splice(i, 1);
				    i--;
				    len--;
				    // increase the movement frequence of the aliens
				    // when there are less of them
				    switch (len2) {
					    case 30 : this.lvFrame = 40; break;
					    case 10 : this.lvFrame = 20; break;
					    case 5  : this.lvFrame = 15; break;
					    case 1  : this.lvFrame = 6;  break;
				    }
			    }
		    }
		}

		if (b.from === 'alien') {
		    // check if bullet hits the tank

		    var collision = hasCollision(
		        b.x,
		        b.y,
		        b.width,
		        b.height,
		        tank.x,
		        tank.y,
		        tank.w,
		        tank.h
		    )

		    if (collision) {
		        endGameLose();

				bullets.splice(i, 1);
				i--;
				len--;
		    }
		}
	}
	// makes the alien shoot in an random fashion 
	if (Math.random() < 0.01 && aliens.length > 0) {
		var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
		// iterate through aliens and check collision to make
		// sure only shoot from front line
		for (var i = 0, len = aliens.length; i < len; i++) {
			var b = aliens[i];

			if (hasCollision(a.x, a.y, a.w, 100, b.x, b.y, b.w, b.h)) {
				a = b;
			}
		}
		// create and append new bullet
		var newBullet = new Bullet(
		    a.x + a.w*0.5,
		    a.y + a.h,
		    2,
		    2,
		    4,
		    '#ff0000',
		    'alien'
		);

		bullets.push(newBullet);
	}


	// update the aliens at the current movement frequency
	if (frames % lvFrame === 0) {
		spFrame = (spFrame + 1) % 2;

		var max = 0, min = game.width;
		// iterate through aliens and update postition

		for (var i = 0, len = aliens.length; i < len; i++) {
			var a = aliens[i];
			a.x += 30 * dir;
			// find min/max values of all aliens for direction
			// change test
			max = Math.max(max, a.x + a.w);
			min = Math.min(min, a.x);
		}

		// check if aliens should move down and change direction
		if (max > game.width - 30 || min < 30) {
			// mirror direction and update position
			dir *= -1;
			for (var i = 0, len = aliens.length; i < len; i++) {
				aliens[i].x += 30 * dir;
				aliens[i].y += 30;

			    if (aliens[i].y > maxAliensY) {
			        maxAliensY = aliens[i].y;
			    }
			}
		}

		if (maxAliensY >= citiesLimit) {
		    endGameLose();
		}
	}
};

/**
 * Render the game state to the canvas
 */
function render() {
	game.clear(); // clear the game canvas

    if (endGame) {
        //aliens = [];
        //bullets = [];
    }

	// draw all aliens
	for (var i = 0, len = aliens.length; i < len; i++) {
		var a = aliens[i];
		game.drawSprite(a.sprite[spFrame], a.x, a.y);
	}
	// save context and draw bullet then restore
	game.ctx.save();

	for (var i = 0, len = bullets.length; i < len; i++) {
		game.drawBullet(bullets[i]);
	}

	game.ctx.restore();

	// draw the city graphics to the canvas
	game.ctx.drawImage(
	    cities.canvas,
	    0,
	    cities.y
	);

	// draw the tank sprite
	game.ctx.drawImage(
	    tank.canvas,
	    tank.x,
	    tank.y
	);
};

// start and run the game
main();
