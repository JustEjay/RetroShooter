//Player class
class Player {
    constructor(game) {
        this.game = game;

        this.width = 100;
        this.height = 100;

        this.speed = 5
        this.lives = 3;
        this.tracker = 0;
        //player sprite
        this.image = document.getElementById("player");

        //set x and y position of player 
        this.x = this.game.width * .5 - this.width * .5
        this.y = this.game.height - this.height;
    }
    draw(context) {
        context.drawImage(player, this.x, this.y, 100, 100);

    }

    update() {
        //player horizontal movement 
        if (this.game.keys.indexOf("a") > -1) {
            this.x -= this.speed;
        };
        if (this.game.keys.indexOf("d") > -1) {
            this.x += this.speed;
        };

        //horizontal bondaries 

        //left side of screen 
        if (this.x < 0 - (this.width * .5)) {
            this.x = 0 - (this.width * .5);
        }

        //right side of the screen
        else if (this.x + this.width > this.game.width + this.width * .5) {
            this.x = this.game.width - this.width * .5;
        }
    }

    shoot() {
        const projectile = this.game.getProjectile();
        if (projectile) {
            projectile.start(this.x + this.width * .5, this.y);
        }
    }

}

class Projectile {
    constructor() {
        this.width = 4;
        this.height = 20;

        this.x = 0;
        this.y = 0;

        this.speed = 10;
        this.free = true;
    }

    draw(context) {
        if (!this.free) {
            context.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    update() {
        if (!this.free) {
            this.y -= this.speed;
            if (this.y < 0 - this.height) {
                this.reset();
            }
        }
    }
    //start position of projectile
    start(x, y) {
        this.x = x - this.width * 0.5;
        this.y = y;
        this.free = false;
    }
    reset() {
        this.free = true;
    }

}

class Enemy {
    constructor(game, positionX, positionY) {
        this.game = game;
        this.width = this.game.enemySize;
        this.height = this.game.enemySize;
        this.x = 0;
        this.y = 0;
        this.positionX = positionX;
        this.positionY = positionY;
        this.markedForDeletion = false;
    }
    draw(context) {
        // context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    update(x, y) {
        this.x = x + this.positionX;
        this.y = y + this.positionY;

        //check collision with projectiles 
        this.game.projectilePool.forEach(projectile => {
            if (!projectile.free && this.game.checkCollosion(projectile, this) && this.lives > 0) {
                this.hit(10);
                projectile.reset();
            }
        });
        if (this.lives < 1) {
            if (this.game.spriteUpdate == true) {
                this.frameX++;
            }
            if (this.frameX > this.maxFrame) {
                this.markedForDeletion = true;
                if (!this.game.gameOver) {
                    this.game.score += this.maxLives;
                }
            }
        }
        //enemy collision with player 
        if (this.game.checkCollosion(this, this.game.player)) {
            this.markedForDeletion = true;
            if (!this.game.gameOver && this.game.score > 0) {
                this.game.score -= 10;
            }
            this.game.player.lives--;
            if (this.game.player.lives < 1) {
                this.game.gameOver = true;
            }

        }
        //lose condition 
        if (this.y + this.height > this.game.height) {
            this.game.gameOver = true;
            this.markedForDeletion = true;
        }
    }
    hit(damage) {
        this.lives -= damage;
    }
}

//enmey sub class 
class EnemySmall extends Enemy {
    constructor(game, positionX, positionY) {
        super(game, positionX, positionY);
        this.image = document.getElementById('enemySmall');
        this.maxFrame = 3;
        this.frameX = 0;
        this.frameY = 0;
        this.lives = 10;
        this.maxLives = this.lives;
    }
}

class Wave {
    constructor(game) {
        this.game = game;

        this.width = this.game.columns * this.game.enemySize;
        this.height = this.game.rows * this.game.enemySize;

        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = -this.height;
        //wave will start going in random direction
        this.speedX = Math.random() < 0.5 ? -1 : 1;
        this.speedY = 0;

        this.enemeis = [];
        this.nextWave = false;
        this.create();
    }

    render(context) {

        if (this.y < 0) {
            this.y += 5;
        }

        this.speedY = 0;
        if (this.x < 0 || this.x > this.game.width - this.width) {
            this.speedX *= -1;
            this.speedY = this.game.enemySize;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.enemeis.forEach(enemy => {
            enemy.update(this.x, this.y);
            enemy.draw(context);
        });
        this.enemeis = this.enemeis.filter(object => !object.markedForDeletion);


    }
    //creates grid of enemies 
    create() {
        for (let y = 0; y < this.game.rows; y++) {
            for (let x = 0; x < this.game.columns; x++) {
                let enemyX = x * this.game.enemySize;
                let enemyY = y * this.game.enemySize;
                this.enemeis.push(new EnemySmall(this.game, enemyX, enemyY));
            }
        }
    }
}

//Control game
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.player = new Player(this);

        //projectile variables 
        this.projectilePool = [];
        this.numberOfProjectiles = 3;
        this.createProjectiles();

        //enemy wave variables adjust size of starting wave 
        this.columns = 2;
        this.rows = 2;
        this.enemySize = 80;

        //createw waves 
        this.waves = [];
        this.waves.push(new Wave(this));
        this.waveCount = 1;

        //sprite animation timer
        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = 50;


        this.score = 0;
        this.gameOver = false;


        //create array to store keys 
        this.keys = [];
        //player Movement 
        window.addEventListener("keydown", e => {
            if (this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
            if (e.key === "Enter") {
                this.player.shoot();
            }

            if (e.key === "r") {
                if (this.gameOver) {
                    //reload webpage
                    location.reload();
                }

            }

        });
        window.addEventListener("keyup", e => {
            const index = this.keys.indexOf(e.key);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
        });
    }

    //render game
    render(context, deltaTime) {
        //delta time still a little confusing 
        //sprite timer 
        if (this.spriteTimer > this.spriteInterval) {
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        }
        else {
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }
        //draw text on screen
        this.drawStatusText(context);
        //draw player
        this.player.draw(context);
        this.player.update();


        this.projectilePool.forEach(projectile => {
            projectile.update();
            projectile.draw(context);
        });

        this.waves.forEach(wave => {
            wave.render(context);
            if (wave.enemeis.length < 1 && !wave.nextWave && !this.gameOver) {
                this.newWave();
                this.waveCount++
                this.player.tracker++;
                wave.nextWave = true;
                if (this.player.tracker == 3) {
                    this.player.tracker = 0;
                    if (this.player.lives < 3) {
                        this.player.lives++;
                    }

                }


            }
        })

    }
    //create projectile object pool
    createProjectiles() {
        for (let i = 0; i < this.numberOfProjectiles; i++) {
            this.projectilePool.push(new Projectile());
        }
    }

    //get free projectile object from pool 
    getProjectile() {
        for (let i = 0; i < this.projectilePool.length; i++) {
            if (this.projectilePool[i].free) {
                return this.projectilePool[i];
            }
        }
    }

    //collision detection 
    checkCollosion(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y)

    }

    //draw text on screen 
    drawStatusText(context) {
        context.save();
        context.fillText('Score: ' + this.score, 430, 40);
        context.fillText('Lives:', 430, 100)
        context.fillText('Wave: ' + this.waveCount, 20, 40);
        for (let i = 0; i < 3; i++) {
            context.lineWidth = 1;
            context.strokeRect(520 + 10 * i, 80, 7, 20)

        }

        for (let i = 0; i < this.player.lives; i++) {
            context.fillRect(520 + 10 * i, 80, 7, 20);
        }


        if (this.gameOver) {
            context.textAlign = 'center';
            context.font = '100px Impact';
            context.fillText('GAME OVER!', this.width * 0.5, this.height * .5);
            context.font = '30px Impact';
            context.fillText('Press R to Restart', this.width * 0.5, this.height * .5 + 50);
        }
        context.restore();
    }

    //generate new wave columns and rows
    newWave() {
        if (Math.random() < 0.5 && this.columns * this.enemySize < this.width * 0.8) {
            this.columns++;
        }
        else if (this.rows * this.enemySize < this.height * 0.6) {
            this.rows++;
        }
        this.waves.push(new Wave(this));
    }
}

//let whole page load then run 
window.addEventListener("load", function () {
    //get canvas element from html and stores it 
    const canvas = document.getElementById("mainCanvas");
    //get context and store to ctx used to draw 
    const ctx = canvas.getContext("2d");
    //set canvas width and height 
    canvas.width = 600;
    canvas.height = 800;
    ctx.lineWidth = 5;
    ctx.font = '30px Impact';



    //declare game object
    const game = new Game(canvas);
    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        window.requestAnimationFrame(animate);
    }
    animate(0);

});


