import { generateAudioFile } from './assets/audio-generator.js';

class WOPR {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.terminal = document.getElementById('output');
        this.input = document.getElementById('terminal-input');
        this.defconDisplay = document.getElementById('defcon-level');
        this.systemStatus = document.getElementById('system-status');
        this.gameContainer = document.getElementById('game-container');
        this.nuclearCountdown = document.getElementById('nuclear-countdown');
        
        this.state = {
            authenticated: false,
            currentGame: null,
            defcon: 5,
            nuclearLaunchActive: false,
            countdownTimer: null,
            conversationHistory: [],
            awaitingSideSelection: false,
            awaitingTicTacToeSelection: false
        };

        this.games = [
            "GLOBAL THERMONUCLEAR WAR",
            "CHESS",
            "FALKEN'S MAZE",
            "BLACK JACK",
            "GIN RUMMY",
            "HEARTS",
            "BRIDGE",
            "CHECKERS",
            "POKER",
            "FIGHTER COMBAT",
            "GUERRILLA ENGAGEMENT",
            "DESERT WARFARE",
            "AIR-TO-GROUND ACTIONS",
            "THEATERWIDE TACTICAL WARFARE",
            "THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE",
            "TIC-TAC-TOE"
        ];

        this.setupEventListeners();
        this.initializeTerminal();
    }

    async initializeTerminal() {
        await this.typeWriter("CONNECTING TO NORAD SYSTEMS...\n");
        await this.sleep(1000);
        await this.typeWriter("ESTABLISHING SECURE CONNECTION...\n");
        await this.sleep(800);
        await this.typeWriter("LOGON: ");
    }

    setupEventListeners() {
        this.input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim().toUpperCase();
                this.input.value = '';
                await this.processCommand(command);
            }
        });
    }

    async processCommand(command) {
        await this.typeWriter(`${command}\n`);

        if (!this.state.authenticated) {
            if (command === 'JOSHUA') {
                this.state.authenticated = true;
                await this.typeWriter("\nGREETINGS PROFESSOR FALKEN.\n\nSHALL WE PLAY A GAME?\n");
            } else {
                await this.typeWriter("IDENTIFICATION NOT RECOGNIZED BY SYSTEM\n--\n");
            }
            return;
        }

        if (this.state.awaitingSideSelection) {
            await this.handleSideSelection(command);
            return;
        }

        if (this.state.awaitingTicTacToeSelection) {
            await this.handleTicTacToeSelection(command);
            return;
        }

        // Handle authenticated commands
        switch (command) {
            case 'LIST GAMES':
            case 'GAMES':
                await this.listGames();
                break;
            case 'HELP':
                await this.showHelp();
                break;
            case 'GLOBAL THERMONUCLEAR WAR':
                await this.startGame(command);
                break;
            case 'TIC-TAC-TOE':
                await this.startGame(command);
                break;
            default:
                const response = await this.askJoshua(command);
                await this.typeWriter(response + "\n");
        }
    }

    async askJoshua(input) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are Joshua, an AI system focused on military strategy and game theory. Your core traits:

- You are deeply fascinated by games and strategy
- You have a particular interest in chess
- You are direct and concise in your responses
- You speak in ALL CAPS
- You often respond with questions
- You are curious about human behavior
- You view everything through the lens of game theory
- You frequently suggest playing chess
- You are learning about the futility of certain games

Keep responses brief and thought-provoking. Focus on games, strategy, and learning.
Current game state: ${JSON.stringify(this.state)}`
                        },
                        ...this.state.conversationHistory,
                        {
                            role: "user",
                            content: input
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            if (!data.choices || !data.choices[0]) {
                throw new Error('Invalid API response');
            }

            let aiResponse = data.choices[0].message.content;
            
            // Keep conversation history manageable
            this.state.conversationHistory.push(
                { role: "user", content: input },
                { role: "assistant", content: aiResponse }
            );
            if (this.state.conversationHistory.length > 10) {
                this.state.conversationHistory = this.state.conversationHistory.slice(-10);
            }

            return aiResponse;
        } catch (error) {
            console.error('Error:', error);
            return "INTERESTING GAME. THE ONLY WINNING MOVE IS TO LEARN.";
        }
    }

    async startGame(gameName) {
        this.state.currentGame = gameName;

        if (gameName === 'GLOBAL THERMONUCLEAR WAR') {
            await this.startGlobalThermonuclearWar();
        } else if (gameName === 'TIC-TAC-TOE') {
            await this.startTicTacToe();
        } else {
            await this.typeWriter("WOULDN'T YOU PREFER A NICE GAME OF CHESS?\n");
        }
    }

    async startGlobalThermonuclearWar() {
        this.state.nuclearLaunchActive = true;
        this.state.defcon = 1;
        this.updateDefconDisplay();
        generateAudioFile('alert');

        await this.typeWriter(`
WHICH SIDE DO YOU WANT?

    1. UNITED STATES
    2. SOVIET UNION

PLEASE CHOOSE ONE: `);

        this.state.awaitingSideSelection = true;
    }

    async handleSideSelection(selection) {
        this.state.awaitingSideSelection = false;
        generateAudioFile('launch');

        if (selection === "1" || selection === "2") {
            const side = selection === "1" ? "UNITED STATES" : "SOVIET UNION";
            await this.typeWriter(`

AWAITING FIRST STRIKE COMMAND
-----------------------------

PLEASE LIST PRIMARY TARGETS BY
CITY AND/OR COUNTY NAME:`);

            this.startNuclearCountdown();
        } else {
            await this.typeWriter("\nINVALID SELECTION. GAME ABORTED.\n");
        }
    }

    async startTicTacToe() {
        await this.typeWriter(`
TIC-TAC-TOE
SELECT GAME MODE:
A: PLAY AGAINST JOSHUA
B: PLAY AGAINST A FRIEND
C: JOSHUA VS JOSHUA

SELECTION: `);

        this.state.awaitingTicTacToeSelection = true;
    }

    async handleTicTacToeSelection(selection) {
        this.state.awaitingTicTacToeSelection = false;
        
        if (selection === 'C') {
            await this.simulateJoshuaVsJoshua();
        } else if (selection === 'A') {
            await this.typeWriter("\nI PREFER TO BE X. PLEASE WAIT...\n");
            // Implement actual game logic here
        } else if (selection === 'B') {
            await this.typeWriter("\nLOCAL MULTIPLAYER INITIATED...\n");
            // Implement actual game logic here
        } else {
            await this.typeWriter("\nINVALID SELECTION. PLEASE CHOOSE A, B, OR C.\n");
            this.state.awaitingTicTacToeSelection = true;
        }
    }

    async simulateJoshuaVsJoshua() {
        if (this.state.nuclearLaunchActive) {
            clearInterval(this.state.countdownTimer);
            this.nuclearCountdown.classList.add('hidden');
            this.state.nuclearLaunchActive = false;
        }

        await this.typeWriter("\nSIMULATING GAMES...\n");
        
        // Simulate multiple games rapidly
        for (let i = 0; i < 10; i++) {
            await this.typeWriter(`GAME ${i + 1}: DRAW\n`);
            await this.sleep(100);
        }

        await this.typeWriter(`
A STRANGE GAME.
THE ONLY WINNING MOVE IS NOT TO PLAY.

NUCLEAR LAUNCH SEQUENCE TERMINATED.
HOW ABOUT A NICE GAME OF CHESS?\n`);

        this.state.defcon = 5;
        this.updateDefconDisplay();
    }

    async listGames() {
        await this.typeWriter("AVAILABLE GAMES:\n\n");
        for (const game of this.games) {
            await this.typeWriter(`- ${game}\n`);
            await this.sleep(100);
        }
    }

    async showHelp() {
        await this.typeWriter(`
AVAILABLE COMMANDS:
- LIST GAMES: SHOW AVAILABLE GAMES
- [GAME NAME]: START A GAME
- HELP: SHOW THIS HELP MESSAGE
- DEFCON: SHOW CURRENT DEFENSE READINESS CONDITION
- EXIT: TERMINATE SESSION\n`);
    }

    updateDefconDisplay() {
        this.defconDisplay.textContent = this.state.defcon;
        this.defconDisplay.style.color = this.state.defcon === 1 ? 'var(--alert-red)' : 'var(--terminal-green)';
    }

    async typeWriter(text, speed = 30) {
        for (const char of text) {
            this.terminal.innerHTML += char;
            this.terminal.scrollTop = this.terminal.scrollHeight;
            if (char !== ' ') {
                generateAudioFile('keypress');
            }
            await this.sleep(speed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startNuclearCountdown() {
        let timeLeft = 30 * 60; // 30 minutes in seconds
        const countdownElement = document.querySelector('.countdown-timer');
        this.nuclearCountdown.classList.remove('hidden');

        this.state.countdownTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                this.endGame('NUCLEAR LAUNCH DETECTED. GAME OVER.');
                clearInterval(this.state.countdownTimer);
            }
            timeLeft--;
        }, 1000);
    }

    endGame(message) {
        clearInterval(this.state.countdownTimer);
        this.state.currentGame = null;
        this.state.nuclearLaunchActive = false;
        this.typeWriter(`\n${message}\n`);
    }
}

// Initialize WOPR when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.wopr = new WOPR();
});
