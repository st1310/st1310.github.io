// GLOBAL VARS & TYPES
let idealFrameRate = 60;
let internalCanvasHeight = 700;
let internalCanvasWidth = 500;
let scaleFactor = 1;
let score = 0;
let touchLeft = false;
let touchRight = false;
let debug = false;

let doodler: DoodleJumpCharacter;
let generator: PlatformGenerator;
let platforms: Platform[];

let bg: any, doodlerRight: any, doodlerShort: any, platform: any, qrCode: any; // Image

// P5 WILL AUTOMATICALLY USE GLOBAL MODE IF A DRAW() FUNCTION IS DEFINED
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");

    bg = loadImage("sketch/resources/bg.png");
    doodlerRight = loadImage("sketch/resources/doodler-right.png");
    doodlerShort = loadImage("sketch/resources/doodler-short.png");
    platform = loadImage("sketch/resources/platform.png");
    qrCode = loadImage("sketch/resources/qr-code.png");

    //createCanvas(windowWidth, windowHeight);
    if (windowHeight > windowWidth) {
        createCanvas(windowWidth, windowHeight);
        internalCanvasWidth =
            (internalCanvasHeight * windowWidth) / windowHeight;
    } else {
        createCanvas(
            (internalCanvasWidth * windowHeight) / internalCanvasHeight,
            windowHeight
        );
        internalCanvasWidth =
            (internalCanvasWidth * windowHeight) / internalCanvasHeight;
    }
    scaleFactor = windowHeight / internalCanvasHeight;

    frameRate(idealFrameRate);

    let buttonLeft = createDiv();
    buttonLeft.addClass("button-left");
    buttonLeft.touchStarted(() => {
        touchLeft = true;
        buttonLeft.addClass("button-left-active");
    });
    buttonLeft.touchEnded(() => {
        touchLeft = false;
        buttonLeft.removeClass("button-left-active");
    });
    let buttonRight = createDiv();
    buttonRight.addClass("button-right");
    buttonRight.touchStarted(() => {
        touchRight = true;
        buttonRight.addClass("button-right-active");
    });
    buttonRight.touchEnded(() => {
        touchRight = false;
        buttonRight.removeClass("button-right-active");
    });

    initGame();
}

// p5 WILL AUTO RUN THIS FUNCTION IF THE BROWSER WINDOW SIZE CHANGES
function windowResized() {
    //resizeCanvas(windowWidth, windowHeight);
}

// p5 WILL HANDLE REQUESTING ANIMATION FRAMES FROM THE BROWSER AND WIL RUN DRAW() EACH ANIMATION FROME
function draw() {
    scale(scaleFactor);

    // CLEAR BACKGROUND
    background(0);
    image(bg, 0, 0);

    // CENTER OF SCREEN
    //translate(width / 2,height / 2);

    platforms.forEach((platform) => {
        platform.draw();
    });

    doodler.draw();
    doodler.update(deltaTime / 100, platforms);

    if (doodler.movePlatforms) {
        const platform = generator.generatePlatform();
        if (platform) {
            platforms.push(new Platform(platform.x, platform.y));
            if (debug)
                console.log(
                    `x=${platform.x.toFixed(2)}, y=${platform.y.toFixed(2)}`
                );
        } else {
            if (debug) console.log("Platform is null");
        }
    }

    // Score
    push();
    fill(0, 0, 0, 125);
    rect(0, 0, internalCanvasWidth, 50);
    fill(255, 255, 255);
    textSize(30);
    textAlign(CENTER);
    text(score, internalCanvasWidth / 2, 40);
    pop();

    if (score >= 2600) {
        noLoop();
        winnerMessage();
    }
}

function initGame() {
    score = 0;
    doodler = new DoodleJumpCharacter();
    generatePlatforms();
}

function generatePlatforms() {
    // Example usage:
    platforms = [
        new Platform(internalCanvasWidth / 2, internalCanvasHeight - 15),
    ];

    const platformHeight = 15; // Example platform height
    const platformWidth = 60; // Example platform width
    const maxJumpHeight = 120; // Maximum height the character can jump

    generator = new PlatformGenerator(
        platformHeight,
        platformWidth,
        maxJumpHeight
    );

    // Generate 10 platforms
    for (let i = 0; i < 10; i++) {
        const platform = generator.generatePlatform();
        if (platform) {
            platforms.push(new Platform(platform.x, platform.y));
            if (debug)
                console.log(
                    `Platform ${i}: x=${platform.x.toFixed(
                        2
                    )}, y=${platform.y.toFixed(2)}`
                );
        }
    }
}

function winnerMessage() {
    textSize(30);
    image(bg, 0, 0);
    textAlign(CENTER);
    text("🎊 Happy Birthday! 🎉", internalCanvasWidth / 2, 50);
    textSize(25);
    text("Here is your reward", internalCanvasWidth / 2, 100);
    image(
        qrCode,
        0,
        internalCanvasHeight - internalCanvasWidth,
        internalCanvasWidth,
        internalCanvasWidth
    );
}

class DoodleJumpCharacter {
    // Constants
    private readonly GRAVITY: number = 9.8; // Acceleration due to gravity (m/s^2)
    private readonly JUMP_VELOCITY: number = 60; // Initial jump velocity (m/s)

    // Properties
    private positionX: number = internalCanvasWidth / 2; // Horizontal position (height) of the character
    private positionY: number = 0; // Vertical position (height) of the character
    private velocityY: number = 0; // Vertical velocity of the character

    private previousX: number = 0;
    private previousY: number = 0;

    private height: number = 60;
    private width: number = 40;

    movePlatforms: boolean;

    constructor() {
        // Initialize the character (e.g., set initial position)
        this.positionX = internalCanvasWidth / 2;
        this.positionY = internalCanvasHeight - this.height - 50;
        this.velocityY = 0;

        this.previousX = this.positionX;
        this.previousY = this.positionY;
    }

    // Method to simulate jumping
    jump() {
        // Apply an upward velocity when jumping
        this.velocityY = this.JUMP_VELOCITY;
    }

    // Method to update the character's position (called in the game loop)
    update(deltaTime: number, platforms: Platform[]) {
        // Apply gravity to the character
        this.velocityY -= this.GRAVITY * deltaTime;
        // Update the position based on velocity
        this.positionY -= this.velocityY * deltaTime;

        if (this.positionY < internalCanvasHeight / 2) {
            this.positionY = internalCanvasHeight / 2;
            this.movePlatforms = true;
            score++;
        } else {
            this.movePlatforms = false;
        }

        // Ensure the character doesn't fall below the ground (e.g., screen boundary)
        // if (this.positionY < 0) {
        //     this.positionY = 0;
        //     this.velocityY = 0; // Reset velocity when touching the ground
        // }

        if (this.positionX + this.width < 0) {
            this.positionX = internalCanvasWidth;
        }
        if (this.positionX > internalCanvasWidth) {
            this.positionX = -this.width;
        }

        // Collision detection with platforms
        for (const platform of platforms) {
            if (this.isOnPlatform(platform)) {
                this.jump(); // Jump if there's a collision
            }
            if (this.movePlatforms) {
                platform.y += this.velocityY * deltaTime;
                if (platform.y > internalCanvasHeight) {
                    platforms.shift();
                }
            }
        }

        // Ensure the character doesn't fall below the ground (e.g., screen boundary)
        if (this.positionY + this.height > internalCanvasHeight) {
            //this.jump();
            initGame();
        }

        // Arrow controls
        if (keyIsDown(LEFT_ARROW) || touchLeft) {
            this.positionX -= 4;
        }
        if (keyIsDown(RIGHT_ARROW) || touchRight) {
            this.positionX += 4;
        }

        this.previousX = this.positionX;
        this.previousY = this.positionY;
    }

    draw() {
        if (debug) {
            rect(this.positionX, this.positionY, this.width, this.height);
        }
        //image(doodlerRight, this.positionX, this.positionY, this.height, this.height);
        image(
            doodlerShort,
            this.positionX - this.height - 10,
            this.positionY - this.height,
            this.height * 3,
            this.height * 2
        );
    }

    private isOnPlatform(platform: Platform): boolean {
        const withinXBounds =
            this.positionX < platform.x + platform.width &&
            this.positionX + this.width > platform.x;
        const withinYBounds =
            this.positionY < platform.y + platform.height &&
            this.positionY + this.height > platform.y;

        const wasOverBounds = this.previousY + this.height < platform.y;

        return (
            withinXBounds &&
            withinYBounds &&
            wasOverBounds &&
            this.velocityY <= 0
        );
    }
}

class Platform {
    x: number = 0; // Horizontal position (height) of the platform
    y: number = 0; // Vertical position (height) of the platform

    height: number = 15;
    width: number = 60;

    constructor(x: number, y: number) {
        // Initialize the character (e.g., set initial position)
        this.x = x;
        this.y = y;
    }

    draw() {
        if (debug) {
            rect(this.x, this.y, this.width, this.height);
        }
        image(
            platform,
            this.x - 4,
            this.y - 3,
            this.width + 9,
            this.height + 7
        );
    }
}

class PlatformGenerator {
    // Constants
    private readonly PLATFORM_HEIGHT: number;
    private readonly PLATFORM_WIDTH: number;
    private readonly MAX_JUMP_HEIGHT: number;

    // State
    private lastPlatformY: number;

    constructor(
        platformHeight: number,
        platformWidth: number,
        maxJumpHeight: number
    ) {
        this.PLATFORM_HEIGHT = platformHeight;
        this.PLATFORM_WIDTH = platformWidth;
        this.MAX_JUMP_HEIGHT = maxJumpHeight;
        //this.lastPlatformY = height - platformHeight; // Start with a platform at the bottom
    }

    // Method to generate a new platform
    generatePlatform(): { x: number; y: number } | null {
        this.lastPlatformY =
            platforms[platforms.length - 1]?.y ??
            internalCanvasHeight - this.PLATFORM_HEIGHT;
        // Calculate the Y position for the new platform
        let newY =
            this.lastPlatformY -
            (Math.random() * this.MAX_JUMP_HEIGHT * 0.5 +
                this.MAX_JUMP_HEIGHT * 0.5);

        // Ensure the new platform is not above the screen bounds
        if (newY < 0) {
            //newY = 0;
            return null;
        }

        // Calculate the X position for the new platform (randomly across the width of the screen)
        const newX =
            Math.random() * (internalCanvasWidth - this.PLATFORM_WIDTH);

        // Update the last platform position
        this.lastPlatformY = newY;

        return { x: newX, y: newY };
    }
}
