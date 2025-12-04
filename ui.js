export class UIController {
    constructor(elements) {
        this.elements = elements;
        this.levelFadeTimeout = null;
        this.gameOverButtonTimeout = null;
    }

    showStartMenu() {
        this.elements.startMenu.classList.remove('hidden');
        this.elements.gameOverMenu.classList.add('hidden');
        this.elements.scoreDisplay.classList.add('hidden');
        this.elements.levelDisplay.classList.add('hidden');
        this.clearTimeouts(); // Clear any pending timeouts
        this.elements.submitScoreBtn.disabled = false;
        this.elements.submitScoreBtn.textContent = 'Submit Highscore';
    }

    showGameScreen() {
        this.elements.startMenu.classList.add('hidden');
        this.elements.gameOverMenu.classList.add('hidden');
        this.elements.scoreDisplay.classList.remove('hidden');
        this.elements.levelDisplay.classList.remove('level-out', 'level-in');
        // Force reflow to ensure animation triggers
        void this.elements.levelDisplay.offsetWidth;
        setTimeout(() => {
            this.elements.levelDisplay.classList.add('level-in');
        }, 50);
    }

    showGameOverMenu(score) {
        this.elements.gameOverMenu.classList.remove('hidden');
        this.elements.scoreDisplay.classList.add('hidden');
        this.elements.levelDisplay.classList.remove('level-in', 'level-out');
        this.elements.finalScoreEl.textContent = score;
        
        const gameOverButtons = this.elements.gameOverMenu.querySelectorAll('button');
        gameOverButtons.forEach(btn => btn.disabled = true);

        // Reset submit button text before it appears
        this.elements.submitScoreBtn.textContent = 'Submit Highscore';
        
        this.gameOverButtonTimeout = setTimeout(() => {
            gameOverButtons.forEach(btn => btn.disabled = false);
        }, 800); // 0.8 second delay

        this.levelFadeTimeout = setTimeout(() => {
            this.elements.levelDisplay.classList.add('hidden');
        }, 3000);
    }

    updateScore(score) {
        this.elements.scoreEl.textContent = score;
    }

    updateLevel(level, isInitial = false) {
        const levelDisplay = this.elements.levelDisplay;
        
        if (isInitial) {
            levelDisplay.classList.remove('hidden'); // Ensure it's visible
            levelDisplay.textContent = level;
            levelDisplay.classList.remove('level-in', 'level-out');
            // Force reflow
            void levelDisplay.offsetWidth;
            setTimeout(() => {
                levelDisplay.classList.add('level-in');
            }, 50);
            return;
        }

        levelDisplay.classList.remove('level-in');
        levelDisplay.classList.add('level-out');

        const onOutAnimationEnd = () => {
            levelDisplay.removeEventListener('animationend', onOutAnimationEnd);
            levelDisplay.textContent = level;
            levelDisplay.classList.remove('level-out');
            levelDisplay.classList.add('level-in');

            const onInAnimationEnd = () => {
                levelDisplay.removeEventListener('animationend', onInAnimationEnd);
                levelDisplay.classList.remove('level-in');
            };
            levelDisplay.addEventListener('animationend', onInAnimationEnd, { once: true });
        };
        levelDisplay.addEventListener('animationend', onOutAnimationEnd, { once: true });
    }

    showReplayContainer() {
        this.elements.replayContainer.classList.remove('hidden');
        this.elements.gameOverMenu.classList.add('hidden');
    }

    hideReplayContainer(origin = 'gameover') {
        this.elements.replayContainer.classList.add('hidden');
        if (origin === 'leaderboard') {
            this.elements.leaderboardView.classList.remove('hidden');
        } else {
            this.elements.gameOverMenu.classList.remove('hidden');
        }
    }

    showLeaderboardView() {
        this.elements.startMenu.classList.add('hidden');
        this.elements.leaderboardView.classList.remove('hidden');
    }

    hideLeaderboardView() {
        this.elements.leaderboardView.classList.add('hidden');
        this.elements.startMenu.classList.remove('hidden');
    }

    showPagination() {
        this.elements.leaderboardPagination.classList.remove('hidden');
    }

    hidePagination() {
        this.elements.leaderboardPagination.classList.add('hidden');
    }

    setSubmitButtonState(state, text) {
        this.elements.submitScoreBtn.disabled = state === 'disabled';
        this.elements.submitScoreBtn.textContent = text;
    }

    clearTimeouts() {
        if (this.levelFadeTimeout) {
            clearTimeout(this.levelFadeTimeout);
            this.levelFadeTimeout = null;
        }
        if (this.gameOverButtonTimeout) {
            clearTimeout(this.gameOverButtonTimeout);
            this.gameOverButtonTimeout = null;
        }
    }
}