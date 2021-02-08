import {Ball,Player} from '../components/entities.js'


class World{
    constructor(canvas) {
        this.canvas = canvas;
        this.width=this.canvas.width;
        this.height=this.canvas.height;
    }
    setDimension(x,y) {
        this.canvas.width=x
        this.canvas.height=y
        this.width=this.canvas.width;
        this.height=this.canvas.height;
    }
}

function lerp(start, end, time) {
    return start * (1 - time) + end * time;
}


class Pong
{
    constructor(canvas)
    {
        this.world=new World(canvas)
        this._canvas = this.world.canvas
        this._context = canvas.getContext('2d');

        this.initialSpeed = 750;
        this.AI_SPEED=5.5

        this.ball = new Ball;

        this.players = [
            new Player,
            new Player,
        ];

        this.players[0].pos.x = 40;
        this.players[1].pos.x = this.world.width - 40;
        this.players.forEach(p => p.pos.y = this.world.height / 2);

        let lastTime = null;
        this._frameCallback = (millis) => {
            if (lastTime !== null) {
                const diff = millis - lastTime;
                this.update(diff / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(this._frameCallback);
        };

        this.CHAR_PIXEL = 10;
        this.CHARS = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        this.reset();
    }
    setDimension(x,y) {
        this.world.setDimension(x,y)
        this.players[1].pos.x = this.world.width - 40;
    }
    clear()
    {
        this._context.fillStyle = '#002';
        this._context.fillRect(0, 0, this.world.width, this.world.height);
    }
    collide(player, ball)
    {
        if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {
            if (ball.vel.x>0) {
                ball.setRight(player.left-1)
            } else {
                ball.setLeft(player.right+1)
            }

            ball.vel.x = -ball.vel.x * 1.05;
            const len = ball.vel.len;
            ball.vel.y += player.vel.y * .2;
            ball.vel.len = len;
        }
    }
    draw()
    {
        this.clear();

        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }
    drawRect(rect)
    {
        this._context.fillStyle = '#ccf';
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }
    drawScore()
    {
        const align = this.world.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char|0], offset + pos * cw, 20);
            });
        });
    }
    play()
    {
        const b = this.ball;
        if (b.vel.x === 0 && b.vel.y === 0) {
            b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
            b.vel.y = 200 * (Math.random() * 2 - 1);
            b.vel.len = this.initialSpeed;
        }
    }
    reset()
    {
        const b = this.ball;
        b.vel.x = 0;
        b.vel.y = 0;
        b.pos.x = this.world.width / 2;
        b.pos.y = this.world.height / 2;
    }
    start()
    {
        requestAnimationFrame(this._frameCallback);
    }
    update(dt)
    {
        //const cvs = this._canvas;
        const ball = this.ball;
        ball.pos.x += ball.vel.x * dt;
        ball.pos.y += ball.vel.y * dt;

        if (ball.right < 0 || ball.left > this.world.width) {
            ++this.players[ball.vel.x < 0 | 0].score;
            this.reset();
        }

        if (ball.vel.y < 0 && ball.top < 0 ||
            ball.vel.y > 0 && ball.bottom > this.world.height) {
            ball.vel.y = -ball.vel.y;
        }

        this.players[1].pos.y = lerp(this.players[1].pos.y, ball.pos.y,dt*this.AI_SPEED)

        this.players.forEach(player => {
            player.update(dt);
            this.collide(player, ball);
        });

        this.draw();

    }
}

export default Pong
