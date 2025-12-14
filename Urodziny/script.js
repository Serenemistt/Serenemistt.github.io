// ============================================
// Hex Birthday - WITH IN-PLACE HEX GAMES
// ============================================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let particles = [];
let confettiActive = false;
let confettiInterval = null;
let balloonsActive = false;
let balloonInterval = null;

const MAX_PARTICLES = 300;
const CONFETTI_SPAWN_RATE = 120;
const BALLOON_SPAWN_RATE = 500;
const CONFETTI_PER_SPAWN = 6;
const BALLOONS_PER_SPAWN = 4;

let cakeClickCount = 0;
let easterEggActivated = false;

// ============================================
// Particle Classes (Same as before)
// ============================================

class Confetti {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 4 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.color = this.randomColor();
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 15 - 7.5;
        this.opacity = 1;
        this.life = 0;
        this.maxLife = 400;
        this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        this.gravity = 0.15;
    }
    
    randomColor() {
        const colors = ['#ff6b9d', '#c06c84', '#f67280', '#6c5b7b', '#355c7d', '#99b898', '#feceab', '#ff847c'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.life++;
        if (this.life > this.maxLife * 0.7) {
            this.opacity = 1 - ((this.life - this.maxLife * 0.7) / (this.maxLife * 0.3));
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        ctx.restore();
    }
    
    isDead() {
        return this.life >= this.maxLife || this.y > canvas.height + 50;
    }
}

class HexBalloon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedY = -(Math.random() * 2.5 + 1.8);
        this.speedX = Math.random() * 3 - 1.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.06 + 0.03;
        this.color = this.randomPastelColor();
        this.hexPattern = this.generateBalloonPattern();
        this.fontSize = Math.random() * 6 + 14;
        this.opacity = 1;
        this.life = 0;
        this.maxLife = 400;
        this.scale = Math.random() * 0.3 + 0.7;
        this.useGlow = Math.random() > 0.5;
    }
    
    randomPastelColor() {
        const pastels = ['#FF6B9D', '#C06C84', '#F67280', '#99B898', '#FECEAB', '#FF847C'];
        return pastels[Math.floor(Math.random() * pastels.length)];
    }
    
    generateBalloonPattern() {
        const hexChars = '0123456789abcdef';
        const pattern = [];
        const rows = [
            { chars: 2, spacing: '   ' },
            { chars: 3, spacing: '  ' },
            { chars: 4, spacing: ' ' },
            { chars: 5, spacing: '' },
            { chars: 5, spacing: '' },
            { chars: 4, spacing: ' ' },
            { chars: 3, spacing: '  ' },
            { chars: 2, spacing: '   ' },
            { chars: 1, spacing: '   ' }
        ];
        
        rows.forEach(row => {
            let line = row.spacing;
            for (let i = 0; i < row.chars; i++) {
                line += hexChars[Math.floor(Math.random() * hexChars.length)] + ' ';
            }
            pattern.push(line);
        });
        
        pattern.push('    │');
        pattern.push('    │');
        pattern.push('    │');
        return pattern;
    }
    
    update() {
        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 1.2 + this.speedX * 0.1;
        this.life++;
        if (this.life > this.maxLife * 0.6) {
            this.opacity = 1 - ((this.life - this.maxLife * 0.6) / (this.maxLife * 0.4));
        }
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.color;
        ctx.font = 'bold ' + this.fontSize + 'px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (this.useGlow && this.opacity > 0.3) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        let yOffset = 0;
        this.hexPattern.forEach(line => {
            ctx.fillText(line, -35, yOffset);
            yOffset += this.fontSize + 2;
        });
        ctx.restore();
    }
    
    isDead() {
        return this.life >= this.maxLife || this.y < -200;
    }
}

// Spawn system
let spawnQueue = [];

function queueParticles(type, count) {
    for (let i = 0; i < count; i++) {
        spawnQueue.push(type);
    }
}

function processSpawnQueue() {
    const spawnPerFrame = 3;
    for (let i = 0; i < spawnPerFrame && spawnQueue.length > 0; i++) {
        if (particles.length >= MAX_PARTICLES) {
            spawnQueue = [];
            return;
        }
        const type = spawnQueue.shift();
        const x = Math.random() * canvas.width;
        if (type === 'confetti') {
            particles.push(new Confetti(x, -20));
        } else if (type === 'balloon') {
            particles.push(new HexBalloon(x, canvas.height + 50));
        }
    }
}

function createConfetti(count) {
    for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) return;
        particles.push(new Confetti(Math.random() * canvas.width, -20));
    }
}

function createBalloons(count) {
    for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) return;
        particles.push(new HexBalloon(Math.random() * canvas.width, canvas.height + 50));
    }
}

function startContinuousConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    queueParticles('confetti', 40);
    confettiInterval = setInterval(() => { createConfetti(CONFETTI_PER_SPAWN); }, CONFETTI_SPAWN_RATE);
}

function startContinuousBalloons() {
    if (balloonsActive) return;
    balloonsActive = true;
    queueParticles('balloon', 15);
    balloonInterval = setInterval(() => { createBalloons(BALLOONS_PER_SPAWN); }, BALLOON_SPAWN_RATE);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    processSpawnQueue();
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}

animate();

// ============================================
// EASTER EGG - Cake Click
// ============================================

const hexCake = document.getElementById('hexCake');
const versionText = document.getElementById('versionText');
const mainContainer = document.getElementById('mainContainer');

hexCake.addEventListener('click', () => {
    startContinuousConfetti();
    startContinuousBalloons();
    
    if (!easterEggActivated) {
        cakeClickCount++;
        console.log('🎂 Clicks: ' + cakeClickCount + '/7');
        if (cakeClickCount >= 7) {
            activateEasterEgg();
        }
    }
    
    hexCake.style.transform = 'scale(1.15)';
    setTimeout(() => { hexCake.style.transform = ''; }, 200);
});

function activateEasterEgg() {
    easterEggActivated = true;
    versionText.textContent = 'Version 777 Made by Kirix';
    versionText.classList.add('special');
    console.log('🎰 UNLOCKED! Click Version 777!');
    versionText.addEventListener('click', startSlotMachine);
}

// ============================================
// GAME 1: HEX SLOT MACHINE
// ============================================

let jackpotCount = 0;

function startSlotMachine() {
    if (!easterEggActivated) return;
    
    mainContainer.classList.add('fade-out');
    setTimeout(() => {
        jackpotCount = 0;
        mainContainer.innerHTML = `
            <div class="hex-slots fade-in">
                <div class="hex-slots-title">🎰 SLOTS 🎰</div>
                <div class="jackpot-counter">Jackpots: <span id="jackpotCount">0</span> / 3</div>
                
                <div class="hex-slot-machine">
                    <div class="hex-slot-display">
                        <div class="hex-reel">
                            <div class="hex-reel-line">┌─────┐</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-value" id="reel1">7</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-line">└─────┘</div>
                        </div>
                        <div class="hex-reel">
                            <div class="hex-reel-line">┌─────┐</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-value" id="reel2">7</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-line">└─────┘</div>
                        </div>
                        <div class="hex-reel">
                            <div class="hex-reel-line">┌─────┐</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-value" id="reel3">7</div>
                            <div class="hex-reel-line">│     │</div>
                            <div class="hex-reel-line">└─────┘</div>
                        </div>
                    </div>
                </div>
                
                <button class="spin-btn" id="spinBtn">SPIN</button>
                <div class="slot-result" id="slotResult"></div>
            </div>
        `;
        mainContainer.classList.remove('fade-out');
        document.getElementById('spinBtn').addEventListener('click', spinSlots);
    }, 500);
}

function spinSlots() {
    const spinBtn = document.getElementById('spinBtn');
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const result = document.getElementById('slotResult');
    
    spinBtn.disabled = true;
    result.textContent = '';
    
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let spins = 0;
    
    const spinInterval = setInterval(() => {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        spins++;
        
        if (spins > 20) {
            clearInterval(spinInterval);
            const isJackpot = Math.random() < 0.2;
            
            if (isJackpot) {
                reel1.textContent = '7';
                reel2.textContent = '7';
                reel3.textContent = '7';
                jackpotCount++;
                document.getElementById('jackpotCount').textContent = jackpotCount;
                result.textContent = '🎉 JACKPOT 777! 🎉';
                
                if (jackpotCount >= 3) {
                    setTimeout(() => {
                        result.textContent = '✅ Wygrałeś! Czas na następną grę...';
                        setTimeout(startBlackjack, 2000);
                    }, 1500);
                } else {
                    spinBtn.disabled = false;
                }
            } else {
                result.textContent = 'Try again!';
                spinBtn.disabled = false;
            }
        }
    }, 100);
}

// ============================================
// GAME 2: BLACKJACK - FIXED
// ============================================

let bjWins = 0;
let playerCards = [];
let dealerCards = [];
let deck = [];
let gameOver = false;

function startBlackjack() {
    bjWins = 0;
    mainContainer.classList.add('fade-out');
    setTimeout(() => {
        mainContainer.innerHTML = `
            <div class="blackjack-game fade-in">
                <h2 class="blackjack-title">🃏 BLACKJACK 🃏</h2>
                <div class="wins-counter">Wins: <span id="bjWinsCount">0</span> / 3</div>
                
                <div class="card-area">
                    <h3>Dealer <span id="dealerTotal"></span></h3>
                    <div class="cards" id="dealerCards"></div>
                </div>
                
                <div class="card-area">
                    <h3>You <span id="playerTotal"></span></h3>
                    <div class="cards" id="playerCards"></div>
                </div>
                
                <div class="blackjack-buttons">
                    <button class="bj-button" id="hitBtn">HIT</button>
                    <button class="bj-button" id="standBtn">STAND</button>
                    <button class="bj-button" id="newHandBtn" style="display:none;">NEW HAND</button>
                </div>
                
                <div class="blackjack-message" id="bjMessage"></div>
            </div>
        `;
        mainContainer.classList.remove('fade-out');
        
        document.getElementById('hitBtn').addEventListener('click', hit);
        document.getElementById('standBtn').addEventListener('click', stand);
        document.getElementById('newHandBtn').addEventListener('click', newBlackjackHand);
        
        newBlackjackHand();
    }, 500);
}

function createDeck() {
    deck = [];
    const suits = ['♥', '♦', '♣', '♠'];
    const values = [
        { display: 'A', value: 11, hex: 'a1' },
        { display: '2', value: 2, hex: 'b2' },
        { display: '3', value: 3, hex: 'c3' },
        { display: '4', value: 4, hex: 'd4' },
        { display: '5', value: 5, hex: 'e5' },
        { display: '6', value: 6, hex: 'f6' },
        { display: '7', value: 7, hex: '07' },
        { display: '8', value: 8, hex: '18' },
        { display: '9', value: 9, hex: '29' },
        { display: '10', value: 10, hex: '3a' },
        { display: 'J', value: 10, hex: '4b' },
        { display: 'Q', value: 10, hex: '5c' },
        { display: 'K', value: 10, hex: '6d' }
    ];
    
    // Create 52 cards
    for (let suit of suits) {
        for (let val of values) {
            deck.push({
                display: val.display,
                value: val.value,
                hex: val.hex,
                suit: suit,
                isAce: val.display === 'A'
            });
        }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function newBlackjackHand() {
    createDeck();
    playerCards = [deck.pop(), deck.pop()];
    dealerCards = [deck.pop(), deck.pop()];
    gameOver = false;
    
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('standBtn').disabled = false;
    document.getElementById('newHandBtn').style.display = 'none';
    document.getElementById('bjMessage').textContent = '';
    
    renderBlackjack(false);
    
    // Check for natural blackjack
    const playerTotal = calculateTotal(playerCards);
    if (playerTotal === 21) {
        setTimeout(() => stand(), 500);
    }
}

function renderBlackjack(showDealer) {
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');
    
    // Render player cards
    playerCardsDiv.innerHTML = '';
    for (let i = 0; i < playerCards.length; i++) {
        const card = playerCards[i];
        playerCardsDiv.innerHTML += `
            <div class="hex-card">
                <div class="card-value">${card.display}</div>
                <div class="card-hex">${card.hex}</div>
            </div>
        `;
    }
    
    // Render dealer cards
    dealerCardsDiv.innerHTML = '';
    for (let i = 0; i < dealerCards.length; i++) {
        if (i === 1 && !showDealer) {
            // Hidden card
            dealerCardsDiv.innerHTML += `
                <div class="hex-card">
                    <div class="card-value">?</div>
                    <div class="card-hex">??</div>
                </div>
            `;
        } else {
            const card = dealerCards[i];
            dealerCardsDiv.innerHTML += `
                <div class="hex-card">
                    <div class="card-value">${card.display}</div>
                    <div class="card-hex">${card.hex}</div>
                </div>
            `;
        }
    }
    
    // Update totals
    const playerTotal = calculateTotal(playerCards);
    document.getElementById('playerTotal').textContent = '(' + playerTotal + ')';
    
    if (showDealer) {
        const dealerTotal = calculateTotal(dealerCards);
        document.getElementById('dealerTotal').textContent = '(' + dealerTotal + ')';
    } else {
        document.getElementById('dealerTotal').textContent = '';
    }
}

function calculateTotal(cards) {
    let total = 0;
    let numAces = 0;
    
    // First pass: count all cards and aces
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        total += card.value;
        if (card.isAce) {
            numAces++;
        }
    }
    
    // Adjust aces from 11 to 1 if busting
    while (total > 21 && numAces > 0) {
        total -= 10; // Convert one ace from 11 to 1
        numAces--;
    }
    
    return total;
}

function hit() {
    if (gameOver) return;
    if (deck.length === 0) {
        console.error('Deck is empty!');
        return;
    }
    
    const newCard = deck.pop();
    playerCards.push(newCard);
    
    renderBlackjack(false);
    
    const total = calculateTotal(playerCards);
    
    if (total > 21) {
        gameOver = true;
        endBlackjackHand('BUST! You lose!', false);
    } else if (total === 21) {
        stand();
    }
}

function stand() {
    if (gameOver) return;
    gameOver = true;
    
    // Reveal dealer's hidden card
    renderBlackjack(true);
    
    // Dealer must draw to 17
    setTimeout(() => {
        dealerDrawCards();
    }, 800);
}

function dealerDrawCards() {
    let dealerTotal = calculateTotal(dealerCards);
    
    // Dealer draws until 17 or higher
    while (dealerTotal < 17 && deck.length > 0) {
        dealerCards.push(deck.pop());
        dealerTotal = calculateTotal(dealerCards);
        renderBlackjack(true);
    }
    
    // Small delay then determine winner
    setTimeout(() => {
        determineWinner();
    }, 500);
}

function determineWinner() {
    const playerTotal = calculateTotal(playerCards);
    const dealerTotal = calculateTotal(dealerCards);
    
    let message = '';
    let won = false;
    
    if (dealerTotal > 21) {
        message = 'Dealer BUSTS! You WIN!';
        won = true;
    } else if (playerTotal > dealerTotal) {
        message = 'You WIN!';
        won = true;
    } else if (playerTotal < dealerTotal) {
        message = 'Dealer wins!';
        won = false;
    } else {
        message = 'PUSH! It\'s a tie.';
        won = false;
    }
    
    endBlackjackHand(message, won);
}

function endBlackjackHand(msg, won) {
    document.getElementById('bjMessage').textContent = msg;
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
    
    if (won) {
        bjWins++;
        document.getElementById('bjWinsCount').textContent = bjWins;
        
        if (bjWins >= 3) {
            setTimeout(() => {
                document.getElementById('bjMessage').textContent = '✅ 3 Wygrane! Czas na nagrode';
                setTimeout(() => {
                    showVictoryScreen();
                }, 2000);
            }, 1500);
            return;
        }
    }
    
    // Show "New Hand" button
    setTimeout(() => {
        document.getElementById('newHandBtn').style.display = 'inline-block';
    }, 1000);
}

// ============================================
// VICTORY SCREEN WITH GIFT CARD
// ============================================

function showVictoryScreen() {
    mainContainer.classList.add('fade-out');
    setTimeout(() => {
        const giftAmount = '40 Złotych';
        const giftCode = 'XXXXX-XXXXX-XXXXX';
        
        mainContainer.innerHTML = `
            <div class="victory-screen fade-in">
                <div class="victory-title">🎉 Wygrałeś wszystkie gry! 🎉</div>
                <div class="victory-subtitle">Tutaj jest twój prezent!:</div>
                
                <div class="hex-gift-card">
                    <div class="hex-card-line">    a1b2c3d4e5f6789abcdef0123456789abc    </div>
                    <div class="hex-card-line">  ╔═══════════════════════════════════════╗  </div>
                    <div class="hex-card-line">  ║ f0e  S T E A M  G I F T  C A R D  1d2 ║  </div>
                    <div class="hex-card-line">  ║                                       ║  </div>
                    <div class="hex-card-line">  ║  3c4  ╔═══════════════════╗      5a6 ║  </div>
                    <div class="hex-card-line">  ║  7b8  ║                   ║      9e0 ║  </div>
                    <div class="hex-card-line">  ║  1f2  ║      🎮 STEAM      ║      3d4 ║  </div>
                    <div class="hex-card-line">  ║  5a6  ║                   ║      7c8 ║  </div>
                    <div class="hex-card-line">  ║  9b0  ║   <span class="hex-card-amount">${giftAmount}</span>       ║      1e2 ║  </div>
                    <div class="hex-card-line">  ║  3f4  ║                   ║      5d6 ║  </div>
                    <div class="hex-card-line">  ║  7a8  ╚═══════════════════╝      9c0 ║  </div>
                    <div class="hex-card-line">  ║                                       ║  </div>
                    <div class="hex-card-line">  ║  ┌─────────────────────────────────┐  ║  </div>
                    <div class="hex-card-line">  ║  │ GIFT CODE:                      │  ║  </div>
                    <div class="hex-card-line">  ║  │ <span class="hex-card-code">${giftCode}</span>       │  ║  </div>
                    <div class="hex-card-line">  ║  └─────────────────────────────────┘  ║  </div>
                    <div class="hex-card-line">  ║                                       ║  </div>
                    <div class="hex-card-line">  ║ 1b2  c3d  4e5  f6a  7b8  9c0  def  1a ║  </div>
                    <div class="hex-card-line">  ╚═══════════════════════════════════════╝  </div>
                    <div class="hex-card-line">    2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9    </div>
                </div>
                
                <div class="birthday-message-final">
                    🎂 Wszystkiego najlepszego Oskar! 🎂<br>
                    Baw sie dobrze! 🎮✨
                </div>
                
                <div class="gift-instructions">
                    No chyba wiesz jak użyć?
                </div>
            </div>
        `;
        mainContainer.classList.remove('fade-out');
    }, 500);
}
// ============================================
// Controls
// ============================================

document.addEventListener('dblclick', (e) => {
    if (e.target !== hexCake) {
        if (confettiInterval) clearInterval(confettiInterval);
        if (balloonInterval) clearInterval(balloonInterval);
        confettiActive = false;
        balloonsActive = false;
        particles = [];
        spawnQueue = [];
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (confettiInterval) clearInterval(confettiInterval);
        if (balloonInterval) clearInterval(balloonInterval);
        confettiInterval = null;
        balloonInterval = null;
        confettiActive = false;
        balloonsActive = false;
    } else {
        particles = [];
        spawnQueue = [];
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        queueParticles('confetti', 25);
        queueParticles('balloon', 5);
    }, 500);
});