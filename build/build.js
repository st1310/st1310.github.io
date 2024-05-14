var idealFrameRate = 60;
var internalCanvasHeight = 700;
var internalCanvasWidth = 500;
var scaleFactor = 1;
var score = 0;
var touchLeft = false;
var touchRight = false;
var debug = false;
var doodler;
var generator;
var platforms;
var bg, doodlerRight, doodlerShort, platform, qrCode;
function setup() {
    console.log("🚀 - Setup initialized - P5 is running");
    bg = loadImage("sketch/resources/bg.png");
    doodlerRight = loadImage("sketch/resources/doodler-right.png");
    doodlerShort = loadImage("sketch/resources/doodler-short.png");
    platform = loadImage("sketch/resources/platform.png");
    qrCode = loadImage("sketch/resources/qr-code.png");
    if (windowHeight > windowWidth) {
        createCanvas(windowWidth, windowHeight);
        internalCanvasWidth =
            (internalCanvasHeight * windowWidth) / windowHeight;
    }
    else {
        createCanvas((internalCanvasWidth * windowHeight) / internalCanvasHeight, windowHeight);
        internalCanvasWidth =
            (internalCanvasWidth * windowHeight) / internalCanvasHeight;
    }
    scaleFactor = windowHeight / internalCanvasHeight;
    frameRate(idealFrameRate);
    var buttonLeft = createDiv();
    buttonLeft.addClass("button-left");
    buttonLeft.touchStarted(function () {
        touchLeft = true;
        buttonLeft.addClass("button-left-active");
    });
    buttonLeft.touchEnded(function () {
        touchLeft = false;
        buttonLeft.removeClass("button-left-active");
    });
    var buttonRight = createDiv();
    buttonRight.addClass("button-right");
    buttonRight.touchStarted(function () {
        touchRight = true;
        buttonRight.addClass("button-right-active");
    });
    buttonRight.touchEnded(function () {
        touchRight = false;
        buttonRight.removeClass("button-right-active");
    });
    initGame();
}
function windowResized() {
}
function draw() {
    scale(scaleFactor);
    background(0);
    image(bg, 0, 0);
    platforms.forEach(function (platform) {
        platform.draw();
    });
    doodler.draw();
    doodler.update(deltaTime / 100, platforms);
    if (doodler.movePlatforms) {
        var platform_1 = generator.generatePlatform();
        if (platform_1) {
            platforms.push(new Platform(platform_1.x, platform_1.y));
            if (debug)
                console.log("x=".concat(platform_1.x.toFixed(2), ", y=").concat(platform_1.y.toFixed(2)));
        }
        else {
            if (debug)
                console.log("Platform is null");
        }
    }
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
    platforms = [
        new Platform(internalCanvasWidth / 2, internalCanvasHeight - 15),
    ];
    var platformHeight = 15;
    var platformWidth = 60;
    var maxJumpHeight = 120;
    generator = new PlatformGenerator(platformHeight, platformWidth, maxJumpHeight);
    for (var i = 0; i < 10; i++) {
        var platform_2 = generator.generatePlatform();
        if (platform_2) {
            platforms.push(new Platform(platform_2.x, platform_2.y));
            if (debug)
                console.log("Platform ".concat(i, ": x=").concat(platform_2.x.toFixed(2), ", y=").concat(platform_2.y.toFixed(2)));
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
    image(qrCode, 0, internalCanvasHeight - internalCanvasWidth, internalCanvasWidth, internalCanvasWidth);
}
var DoodleJumpCharacter = (function () {
    function DoodleJumpCharacter() {
        this.GRAVITY = 9.8;
        this.JUMP_VELOCITY = 60;
        this.positionX = internalCanvasWidth / 2;
        this.positionY = 0;
        this.velocityY = 0;
        this.previousX = 0;
        this.previousY = 0;
        this.height = 60;
        this.width = 40;
        this.positionX = internalCanvasWidth / 2;
        this.positionY = internalCanvasHeight - this.height - 50;
        this.velocityY = 0;
        this.previousX = this.positionX;
        this.previousY = this.positionY;
    }
    DoodleJumpCharacter.prototype.jump = function () {
        this.velocityY = this.JUMP_VELOCITY;
    };
    DoodleJumpCharacter.prototype.update = function (deltaTime, platforms) {
        this.velocityY -= this.GRAVITY * deltaTime;
        this.positionY -= this.velocityY * deltaTime;
        if (this.positionY < internalCanvasHeight / 2) {
            this.positionY = internalCanvasHeight / 2;
            this.movePlatforms = true;
            score++;
        }
        else {
            this.movePlatforms = false;
        }
        if (this.positionX + this.width < 0) {
            this.positionX = internalCanvasWidth;
        }
        if (this.positionX > internalCanvasWidth) {
            this.positionX = -this.width;
        }
        for (var _i = 0, platforms_1 = platforms; _i < platforms_1.length; _i++) {
            var platform_3 = platforms_1[_i];
            if (this.isOnPlatform(platform_3)) {
                this.jump();
            }
            if (this.movePlatforms) {
                platform_3.y += this.velocityY * deltaTime;
                if (platform_3.y > internalCanvasHeight) {
                    platforms.shift();
                }
            }
        }
        if (this.positionY + this.height > internalCanvasHeight) {
            initGame();
        }
        if (keyIsDown(LEFT_ARROW) || touchLeft) {
            this.positionX -= 4;
        }
        if (keyIsDown(RIGHT_ARROW) || touchRight) {
            this.positionX += 4;
        }
        this.previousX = this.positionX;
        this.previousY = this.positionY;
    };
    DoodleJumpCharacter.prototype.draw = function () {
        if (debug) {
            rect(this.positionX, this.positionY, this.width, this.height);
        }
        image(doodlerShort, this.positionX - this.height - 10, this.positionY - this.height, this.height * 3, this.height * 2);
    };
    DoodleJumpCharacter.prototype.isOnPlatform = function (platform) {
        var withinXBounds = this.positionX < platform.x + platform.width &&
            this.positionX + this.width > platform.x;
        var withinYBounds = this.positionY < platform.y + platform.height &&
            this.positionY + this.height > platform.y;
        var wasOverBounds = this.previousY + this.height < platform.y;
        return (withinXBounds &&
            withinYBounds &&
            wasOverBounds &&
            this.velocityY <= 0);
    };
    return DoodleJumpCharacter;
}());
var Platform = (function () {
    function Platform(x, y) {
        this.x = 0;
        this.y = 0;
        this.height = 15;
        this.width = 60;
        this.x = x;
        this.y = y;
    }
    Platform.prototype.draw = function () {
        if (debug) {
            rect(this.x, this.y, this.width, this.height);
        }
        image(platform, this.x - 4, this.y - 3, this.width + 9, this.height + 7);
    };
    return Platform;
}());
var PlatformGenerator = (function () {
    function PlatformGenerator(platformHeight, platformWidth, maxJumpHeight) {
        this.PLATFORM_HEIGHT = platformHeight;
        this.PLATFORM_WIDTH = platformWidth;
        this.MAX_JUMP_HEIGHT = maxJumpHeight;
    }
    PlatformGenerator.prototype.generatePlatform = function () {
        var _a, _b;
        this.lastPlatformY =
            (_b = (_a = platforms[platforms.length - 1]) === null || _a === void 0 ? void 0 : _a.y) !== null && _b !== void 0 ? _b : internalCanvasHeight - this.PLATFORM_HEIGHT;
        var newY = this.lastPlatformY -
            (Math.random() * this.MAX_JUMP_HEIGHT * 0.5 +
                this.MAX_JUMP_HEIGHT * 0.5);
        if (newY < 0) {
            return null;
        }
        var newX = Math.random() * (internalCanvasWidth - this.PLATFORM_WIDTH);
        this.lastPlatformY = newY;
        return { x: newX, y: newY };
    };
    return PlatformGenerator;
}());
//# sourceMappingURL=build.js.map