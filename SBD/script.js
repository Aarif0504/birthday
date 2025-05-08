const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const music = document.getElementById("bg-music");
const birthdayText = document.querySelector(".content");
const photoContainer = document.getElementById("photoContainer");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let explosionCount = 0;
let musicPlayed = false;

const photos = [
    "s-removebg-preview.png",
    "3-removebg-preview.png",
    "4-removebg-preview.png",
    "7-removebg-preview.png",
    "8-removebg-preview.png"
];

function playMusic() {
    if (musicPlayed) return;
    musicPlayed = true;
    music.volume = 0;
    music.play().then(() => {
        let volume = 0;
        const fadeIn = setInterval(() => {
            if (volume < 0.6) {
                volume += 0.05;
                music.volume = volume;
            } else {
                clearInterval(fadeIn);
            }
        }, 200);
    }).catch(() => {
        console.log("Autoplay blocked, retrying...");
        setTimeout(playMusic, 2000);
    });
}

class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = y;
        this.speed = Math.random() * 4 + 4;
        this.exploded = false;
        this.particles = [];
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }

    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach(p => p.update());
        }
    }

    explode() {
        this.exploded = true;
        explosionCount++;

        for (let i = 0; i < 80; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }

        if (explosionCount === 4) {
            birthdayText.style.display = "block";
            setTimeout(() => {
                birthdayText.classList.add("show-text");
                animateEmojis();
                startPhotoLoop();
            }, 500);
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            this.particles.forEach(p => p.draw());
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.alpha = 1;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.015;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function animateEmojis() {
    const emojis = birthdayText.querySelectorAll(".emoji-zoom");
    emojis.forEach(emoji => {
        emoji.classList.add("zoom-bounce");
        setTimeout(() => emoji.classList.remove("zoom-bounce"), 1000);
    });
}

function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((fw, index) => {
        fw.update();
        fw.draw();
        if (fw.exploded && fw.particles.every(p => p.alpha <= 0)) {
            fireworks.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

function launchFireworks() {
    if (music.ended) return;
    let count = Math.random() > 0.5 ? 2 : 3;
    for (let i = 0; i < count; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * (canvas.height / 2);
        fireworks.push(new Firework(x, y));
    }
    setTimeout(launchFireworks, Math.random() * 200 + 600);
}

launchFireworks();
animate();
playMusic();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function startPhotoLoop() {
    const firstImg = document.createElement("img");
    firstImg.src = photos[0];
    firstImg.className = "photo center-photo";
    firstImg.style.left = `${window.innerWidth / 2 - 250}px`;
    firstImg.style.top = `${window.innerHeight / 2 + 80}px`;
    photoContainer.appendChild(firstImg);
    setTimeout(() => firstImg.style.opacity = 0.8, 100);

    setTimeout(() => {
        firstImg.style.opacity = 0;
        setTimeout(() => firstImg.remove(), 1500);
        startRandomPhotoLoop();
    }, 5000);
}

function startRandomPhotoLoop() {
    let lastIndex = -1;
    setInterval(() => {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * photos.length);
        } while (randomIndex === lastIndex);
        lastIndex = randomIndex;

        const img = document.createElement("img");
        img.src = photos[randomIndex];
        img.className = "photo";

        let x;
        if (Math.random() < 0.5) {
            x = Math.random() * (window.innerWidth / 2 - 250);
        } else {
            x = Math.random() * (window.innerWidth / 2 - 250) + (window.innerWidth / 2 + 250);
        }
        const y = Math.random() * (window.innerHeight - 220);

        img.style.left = `${x}px`;
        img.style.top = `${y}px`;

        photoContainer.appendChild(img);
        setTimeout(() => img.style.opacity = 0.8, 100);
        setTimeout(() => {
            img.style.opacity = 0;
            setTimeout(() => img.remove(), 1000);
        }, 3000);
    }, 5000);
}

function showFinalCenterPhoto() {
    const finalImg = document.createElement("img");
    finalImg.src = photos[0];
    finalImg.className = "photo center-photo";
    finalImg.style.left = `${window.innerWidth / 2 - 250}px`;
    finalImg.style.top = `${window.innerHeight / 2 + 80}px`;
    finalImg.style.opacity = 0;
    photoContainer.appendChild(finalImg);
    setTimeout(() => finalImg.style.opacity = 0.8, 200);
}

music.onended = () => {
    showFinalCenterPhoto();

    // Show the Replay button
    const restartButton = document.getElementById("restartButton");
    restartButton.style.display = "block";

    // Optionally re-enable music play on click
    restartButton.addEventListener("click", () => {
        location.reload(); // Simple page reload to replay the animation
    });
};
