const builder_canvas = document.getElementById('canvas2');
const builder_context = builder_canvas.getContext('2d');

builder_canvas.width = window.innerWidth;
builder_canvas.height = window.innerHeight;

const particleCount = 50;
const particles = [];

const colors = ['#777777', '#AAAAAA', '#BBBBBB', '#DDDDDD'];

function drawBackgroundLight() {
    const gradient = builder_context.createRadialGradient(
        builder_canvas.width / 2, builder_canvas.height / 2, 50,
        builder_canvas.width / 2, builder_canvas.height / 2, builder_canvas.width / 2
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 128, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 0, 0.0125)');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

    builder_context.save();
    builder_context.fillStyle = gradient;
    builder_context.fillRect(0, 0, builder_canvas.width, builder_canvas.height);
    builder_context.restore();
}

class Particle {
    constructor() {
        this.reset();
    }

    getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateShape() {
        const segments = Math.floor(Math.random() * 5) + 5;
        const amplitude = Math.random() * 20 + 10;
        const waveLength = 15;
        const controlPoints = [];

        for (let i = 0; i <= segments; i++) {
            const x = i * waveLength;
            const y = Math.sin(i + Math.random() * Math.PI) * amplitude;
            controlPoints.push({ x, y });
        }

        return controlPoints;
    }

    draw() {
        builder_context.save();
        builder_context.translate(this.x, this.y);
        builder_context.rotate(this.angle);

        builder_context.lineWidth = this.thickness;
        builder_context.strokeStyle = this.color;
        builder_context.globalAlpha = this.alpha;
        builder_context.lineJoin = 'round';

        builder_context.beginPath();
        builder_context.moveTo(this.shape[0].x, this.shape[0].y);
        for (let i = 1; i < this.shape.length; i++) {
            builder_context.lineTo(this.shape[i].x, this.shape[i].y);
        }
        builder_context.stroke();

        builder_context.shadowColor = this.color;
        builder_context.restore();
    }

    update() {
        this.elapsedTime += 33.33;

        if (this.elapsedTime < this.lifetime / 4) {
            this.alpha = this.elapsedTime / (this.lifetime / 4);
        } else if (this.elapsedTime < this.lifetime) {
            this.alpha = 1 - ((this.elapsedTime - this.lifetime / 4) / (this.lifetime * 0.75));
        } else {
            this.reset();
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.velocity.x += (Math.random() - 0.5) * 0.1;
        this.velocity.y += (Math.random() - 0.5) * 0.1;

        if (this.x > builder_canvas.width || this.x < 0) {
            this.velocity.x *= -1;
        }
        if (this.y > builder_canvas.height || this.y < 0) {
            this.velocity.y *= -1;
        }

        this.angle += this.angleSpeed * 0.5 + (Math.random() - 0.5) * 0.01;

        this.draw();
    }

    reset() {
        this.x = Math.random() * builder_canvas.width;
        this.y = Math.random() * builder_canvas.height;
        this.color = this.getRandomColor();
        this.alpha = 0;
        this.elapsedTime = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.02 + 0.01;

        this.velocity = {
            x: (Math.random() * 0.2 - 0.1) * 0.2,
            y: (Math.random() * 0.2 - 0.1) * 0.2
        };

        this.lifetime = Math.random() * 50000 + 50000;
        this.shape = this.generateShape();
        this.thickness = Math.random() * 10 + 10;
    }
}

function generateParticles() {
    for (let i = 0; i < particleCount; i++) {
        if (particles.length < particleCount) {
            particles.push(new Particle());
        }
    }
}

function animate3() {
    builder_context.clearRect(0, 0, builder_canvas.width, builder_canvas.height);

    drawBackgroundLight();

    particles.forEach((particle) => {
        particle.update();
    });

    requestAnimationFrame(animate3);
}

generateParticles();
animate3();

window.addEventListener('resize', () => {
    builder_canvas.width = window.innerWidth;
    builder_canvas.height = window.innerHeight;
});
