class Player 
{
    constructor(game)
    {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.x = this.game.width * 0.5 - this.width * 0.5;
        this.y = this.game.height - this.height;
        this.speed= 5;
    }

    draw(context)
    {
        
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update()
    {
        //horizontal movement
        if(this.game.keys.indexOf('a') > -1)
        {
            this.x -= this.speed;
        } 

        if(this.game.keys.indexOf('d') > -1)
        {
            this.x += this.speed;
        } 

        //horizontal bondaries 
        if(this.x <0) 
        {
            this.x = 0;
        }
        else if(this.x > this.game.width - this.width)
        {
            this.x = this.game.width - this.width;
        }
       
    }
    shoot()
    {
        const projectile = this.game.getProjectile();
        if(projectile)
        {
            projectile.start(this.x, this.y);
        }
    }
}

class Projectile
{
    constructor()
    {
        this.width = 4;
        this.height = 20;
        this.x = 0;
        this.y = 0;
        this.speed = 20;
        this.free = true;
    }

    draw(context)
    {
        if(!this.free)
        {
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update()
    {
        if(!this.free)
        {
            this.y -= this.speed;
        }
    }

    start(x, y)
    {
        this.x = x;
        this.y = y;
        this.free = false;
        
    }
    
    reset()
    {
        this.free = false;
    }
}

class Enemy 
{

}

class Game 
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.keys = [];
        this.player = new Player(this);
        
        this.projectilesPool = [];
        this.numberOfProjectiles = 10;
        this.createProjectiles();
        //event listeners
        window.addEventListener('keydown', e =>{
            console.log(e);
            if(this.keys.indexOf(e.key) == -1) this.keys.push(e.key);
            if(e.key === 'Enter')
            {
                this.player.shoot();
            }
            
        });
        window.addEventListener('keyup', e =>{
            const index = this.keys.indexOf(e.key)
            if(index > -1 ) this.keys.splice(index, 1);
        });
    }

    render(context)
    {
        this.player.draw(context);
        this.player.update();
        this.projectilesPool.forEach(projectile => {
            projectile.update();
            projectile.draw(context);
        })
    }
    //create projectiles 
    createProjectiles()
    {
        for(let i = 0; i < this.numberOfProjectiles; i++)
        {
            this.projectilesPool.push(new Projectile());
        }
    }

    //get free projectile object from pool 
    getProjectile()
    {
        for(let i = 0; i < this.projectilesPool.length; i++ )
        {
            if(this.projectilesPool[i].free)
            {
                return this.projectilesPool[i];
            }
        }
    }
}


window.addEventListener('load', function()
{
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 800;

    const game = new Game(canvas);
    
    function animate()
    {
        ctx.clearRect(0,0, canvas.width, canvas.height)
        game.render(ctx);
        window.requestAnimationFrame(animate);
    }
    animate();
})