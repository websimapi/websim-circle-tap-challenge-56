import { hsl } from 'd3-color';
import { getHslStringForLevel, isAngleInArc, getComputedColors } from './utils.js';
import { initAudio, playSuccess, playFail, playStart, getAudioData } from './audio.js';
import { submitScore } from './leaderboard.js'; // This seems unused, but let's keep it in case it's needed elsewhere

// A simplified interface to the LocalStorageSync class in leaderboard.js
const localScoreManager = {
    addScore: (gameData) => {
        try {
            const key = 'circleTapPendingScores';
            const pendingScores = JSON.parse(localStorage.getItem(key)) || [];
            if (!pendingScores.some(s => s.timestamp === gameData.timestamp)) {
                pendingScores.push(gameData);
                localStorage.setItem(key, JSON.stringify(pendingScores));
            }
        } catch (e) {
            console.error("Failed to save score locally:", e);
        }
    }
};

export const difficulties = {
    easy: { speed: 1.2 * Math.PI, size: 0.4, trackWidthFactor: 0.12 }, 
    medium: { speed: 1.5 * Math.PI, size: 0.25, trackWidthFactor: 0.07 },
    hard: { speed: 1.8 * Math.PI, size: 0.15, trackWidthFactor: 0.035 }
};

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.colors = getComputedColors();
        
        // Canvas/Drawing state
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.size = 0;
        this.radius = 0;
        this.lineWidth = 0;

        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.angle = -Math.PI / 2;
        this.direction = 1;
        this.speed = 0;
        this.targetStartAngle = 0;
        this.targetSize = 0;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        this.currentDifficulty = 'easy';
        this.replayFrames = [];
        this.replayConfig = {};
        this.level = 0;
        this.tapsThisLevel = 0;
        this.tapsForNextLevel = 1;
        this.currentColorHsl = hsl(getHslStringForLevel(1));
        this.targetColorHsl = hsl(getHslStringForLevel(1));
        this.lastGameData = {};

        this.onGameOver = null;
        this.onScoreUpdate = null;
        this.onLevelUp = null;
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetHeight;

        let containerSize;

        // On landscape screens (like desktop), we want to simulate a portrait container
        // to keep the game feel consistent with mobile and fit for vertical video.
        if (parentWidth > parentHeight) {
            // Simulate a 9:16 aspect ratio container within the height of the screen.
            const simulatedWidth = parentHeight * (9 / 16);
            // If the simulated width is wider than the actual screen, just use the screen width.
            // Otherwise, use the simulated width. This creates a virtual "phone screen" area.
            containerSize = Math.min(simulatedWidth, parentWidth);
        } else {
            // On portrait screens (mobile), the width is the limiting factor.
            containerSize = parentWidth;
        }

        // Apply a scaling factor to the container size to determine the final canvas size.
        const canvasSize = containerSize * 0.9;
        
        this.canvas.style.width = `${canvasSize}px`;
        this.canvas.style.height = `${canvasSize}px`;

        this.size = canvasSize * this.devicePixelRatio;
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        this.radius = this.size * 0.4;
        this.lineWidth = this.size * difficulties[this.currentDifficulty].trackWidthFactor;
        
        if (this.gameState !== 'playing') {
            this.draw();
        }
    }

    generateNewTarget() {
        this.targetStartAngle = Math.random() * Math.PI * 2;
    }

    start(difficulty) {
        this.currentDifficulty = difficulty;
        this.resizeCanvas();

        initAudio();
        playStart();
        
        const settings = difficulties[difficulty];
        this.speed = settings.speed;
        this.targetSize = settings.size;

        this.score = 0;
        this.angle = -Math.PI / 2;
        this.direction = 1;

        this.level = 1; // Start at level 1, not 0
        this.tapsThisLevel = 0;
        this.tapsForNextLevel = 1;
        
        this.currentColorHsl = hsl(getHslStringForLevel(1));
        this.targetColorHsl = hsl(getHslStringForLevel(1));

        this.generateNewTarget();
        
        this.gameState = 'playing';
        this.replayFrames = [];
        this.replayConfig = {
            difficulty: this.currentDifficulty,
            difficulties,
            colors: this.colors,
        };

        this.lastFrameTime = performance.now();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));

        if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        if (this.onLevelUp) this.onLevelUp(this.level, true); // Pass true to indicate initial level
    }

    gameOver() {
        playFail();
        this.gameState = 'gameover';
        
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        
        this.replayFrames.push({
            angle: this.angle,
            targetStartAngle: this.targetStartAngle,
            targetSize: this.targetSize,
            score: this.score,
            level: this.level, 
            targetColor: this.currentColorHsl.toString(),
            success: false,
            timestamp: performance.now(),
        });

        this.lastGameData = {
            score: this.score,
            level: this.level,
            difficulty: this.currentDifficulty,
            replayData: {
                frames: this.replayFrames,
                config: this.replayConfig,
            },
            timestamp: new Date().toISOString(),
        };

        // Save to local storage immediately, just in case
        localScoreManager.addScore(this.lastGameData);

        if (this.onGameOver) this.onGameOver(this.lastGameData);
    }

    drawVisualizer(pulseAmount) {
        // Only draw if there's a noticeable beat
        if (pulseAmount <= 0.1) return;

        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const outerRadius = this.radius + this.lineWidth / 2;
        const innerRadius = this.radius - this.lineWidth / 2;

        const pulseColor = this.currentColorHsl.copy({opacity: pulseAmount * 0.3});

        // --- Outer Pulse ---
        const maxOuterPulse = this.lineWidth * 0.8;
        const pulseOuterRadius = outerRadius + (pulseAmount * maxOuterPulse);
        
        const outerGradient = this.ctx.createRadialGradient(centerX, centerY, outerRadius, centerX, centerY, pulseOuterRadius);
        outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerGradient.addColorStop(0.8, pulseColor.toString());
        outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, this.size, this.size);

        // --- Inner Pulse ---
        const maxInnerPulse = innerRadius * 0.7; // How far the glow goes inward
        const pulseInnerRadius = innerRadius - (pulseAmount * maxInnerPulse);

        const innerGradient = this.ctx.createRadialGradient(centerX, centerY, pulseInnerRadius, centerX, centerY, innerRadius);
        innerGradient.addColorStop(0, 'rgba(0,0,0,0)');
        innerGradient.addColorStop(0.5, pulseColor.toString());
        innerGradient.addColorStop(1, 'rgba(0,0,0,0)');

        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(0, 0, this.size, this.size);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.size, this.size);

        const audioData = getAudioData();
        let pulseAmount = 0;
        if (audioData) {
            let bass = 0;
            for (let i = 0; i < 5; i++) {
                bass += audioData[i];
            }
            bass /= 5;
            pulseAmount = (bass / 255);
            this.drawVisualizer(pulseAmount);
        }

        const lastFrame = this.replayFrames[this.replayFrames.length-1];
        if(lastFrame) {
            lastFrame.pulseAmount = pulseAmount;
        }

        this.ctx.save();
        this.ctx.translate(this.size / 2, this.size / 2);

        // Draw track
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colors.secondary;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'butt';
        this.ctx.stroke();

        // Draw target zone
        if (this.targetSize > 0) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, this.targetStartAngle, this.targetStartAngle + this.targetSize);
            this.ctx.strokeStyle = this.currentColorHsl.toString();
            this.ctx.lineWidth = this.lineWidth * 0.95;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }

        // Draw rotating line
        this.ctx.rotate(this.angle);
        this.ctx.beginPath();
        this.ctx.moveTo(this.radius - this.lineWidth / 2, 0);
        this.ctx.lineTo(this.radius + this.lineWidth / 2, 0);
        this.ctx.strokeStyle = this.colors.fail;
        this.ctx.lineWidth = this.lineWidth / 2.5;
        this.ctx.lineCap = 'butt';
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Smooth color interpolation
        const lerpFactor = Math.min(deltaTime * 2.5, 1);
        this.currentColorHsl.h += (this.targetColorHsl.h - this.currentColorHsl.h) * lerpFactor;
        this.currentColorHsl.s += (this.targetColorHsl.s - this.currentColorHsl.s) * lerpFactor;
        this.currentColorHsl.l += (this.targetColorHsl.l - this.currentColorHsl.l) * lerpFactor;
        this.currentColorHsl.opacity += (this.targetColorHsl.opacity - this.currentColorHsl.opacity) * lerpFactor;

        this.angle += this.speed * this.direction * deltaTime;
        
        this.replayFrames.push({
            angle: this.angle,
            targetStartAngle: this.targetStartAngle,
            targetSize: this.targetSize,
            score: this.score,
            level: this.level,
            targetColor: this.currentColorHsl.toString(),
            timestamp: currentTime,
            pulseAmount: 0, // Initial value, will be updated in draw()
        });

        this.draw();
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    handleTap() {
        if (this.gameState !== 'playing') return;
        
        const angleTolerance = Math.atan2(this.lineWidth / 2.5, this.radius);
        const inZone = isAngleInArc(this.angle, this.targetStartAngle - angleTolerance, this.targetSize + 2 * angleTolerance);

        if (inZone) {
            playSuccess();
            this.score++;
            
            this.tapsThisLevel++;
            if (this.tapsThisLevel >= this.tapsForNextLevel) {
                this.levelUp();
            }

            this.direction *= -1;
            this.speed *= 1.04;

            const lastFrame = this.replayFrames[this.replayFrames.length - 1];
            if (lastFrame) {
                lastFrame.success = true;
                lastFrame.newTarget = {
                    start: this.targetStartAngle,
                    size: difficulties[this.currentDifficulty].size
                };
            }

            this.generateNewTarget();
            
            if (this.onScoreUpdate) this.onScoreUpdate(this.score);
        } else {
            this.gameOver();
        }
    }

    levelUp() {
        this.targetColorHsl = hsl(getHslStringForLevel(this.level + 1));
        
        this.level++;
        this.tapsThisLevel = 0;
        this.tapsForNextLevel = this.level;

        if (this.onLevelUp) this.onLevelUp(this.level);
    }

    reset() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.gameState = 'start';
        this.score = 0;
        this.level = 1;
        this.tapsThisLevel = 0;
        this.tapsForNextLevel = 1;
        this.currentColorHsl = hsl(getHslStringForLevel(1));
        this.targetSize = difficulties[this.currentDifficulty].size;
        this.targetStartAngle = Math.PI / 4;
        this.angle = -Math.PI / 2;
        this.resizeCanvas();
    }
}