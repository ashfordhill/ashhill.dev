const navLinks = document.querySelectorAll('.nav-link');
const contentText = document.getElementById('contentText');
const featureImage = document.getElementById('featureImage');

const contentData = {
    act1: {
        title: 'directions',
        text: 'keep scrolling',
        image: 'images/1.png'
    },
    act2: {
        title: 'directions',
        text: 'keep scrolling',
        image: 'images/2.png'
    },
    act3: {
        title: 'directions',
        text: 'keep scrolling',
        image: 'images/3.png'
    },
    act4: {
        title: 'directions',
        text: 'keep scrolling',
        image: 'images/4.png'
    },
    act5: {
        title: 'directions',
        text: 'keep scrolling',
        image: 'images/5.png'
    }
};

const acts = ['act1', 'act2', 'act3', 'act4', 'act5'];
const romanLabels = {
    act1: 'I',
    act2: 'II',
    act3: 'III',
    act4: 'IV',
    act5: 'V'
};
const splatterSvgs = [
    'images/paint/splatter1.svg',
    'images/paint/splatter2.svg',
    'images/paint/splatter3.svg',
    'images/paint/splatter4.svg',
    'images/paint/splatter5.svg'
];
const splatterCache = {};
const GAME_OVER_AT = 19;
let currentActIndex = 0;
let loopCount = 1;
let autoScrollInterval = null;
let fastLooping = false;
let gameOver = false;
let gameOverOverlay;
let chaosOverlay;
let chaosReady = false;

function createGameOverOverlay() {
    const overlay = document.createElement('div');
    overlay.classList.add('game-over-overlay');
    overlay.innerHTML = `
        <div class="game-over-card">
            <div class="game-over-title">Game Over</div>
            <button class="game-over-button">Try Again?</button>
        </div>
    `;
    const button = overlay.querySelector('.game-over-button');
    button.addEventListener('click', () => {
        location.reload();
    });
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
    gameOverOverlay = overlay;
}

createGameOverOverlay();

function ensureChaosOverlay() {
    if (chaosReady) return;
    chaosReady = true;
    document.body.classList.add('chaos');
    chaosOverlay = document.createElement('div');
    chaosOverlay.classList.add('chaos-overlay');
    acts.forEach(act => {
        const el = document.createElement('div');
        el.classList.add('chaos-roman');
        el.dataset.act = act;
        el.textContent = romanLabels[act];
        const size = 48 + Math.random() * 220;
        const top = 5 + Math.random() * 70;
        const left = 5 + Math.random() * 80;
        const rot = Math.random() * 20 - 10;
        const skew = Math.random() * 10 - 5;
        el.style.top = `${top}%`;
        el.style.left = `${left}%`;
        el.style.transform = `scale(${0.8 + Math.random() * 0.6}) rotate(${rot}deg) skew(${skew}deg)`;
        el.style.fontSize = `${size}px`;
        chaosOverlay.appendChild(el);
    });
    document.body.appendChild(chaosOverlay);
}

function updateAct(actId) {
    const data = contentData[actId];
    const randomActId = acts[Math.floor(Math.random() * acts.length)];
    const imageActId = loopCount >= 7 ? randomActId : actId;
    const imageData = contentData[imageActId];
    const glitchText = 'k̴̢̧̤̖̖͉̮̭̫̪̥̻̿̏́̏̔̔̈́͘͜͝ȅ̴̜̩͕̰̓̈́̇̏̾͑̕͝e̷͎̖̖̪͇̟̫̿͊̔̓̆̉̍̏͋͌̋͠͝͝p̸̧̩̖̰̗͓̞͕̞͕̣̋͊̐̂̉̒̒͆͂̕ ̵̳̪́͒̂̒̓́̎̈́͛̉s̵̜̳͇̘͍̭̓̇͗͑͗̆͋̽c̵͐̄͒̽͋̔̈́̎̓̚̚͜r̵̟̜̟̪͕͒̋̎͊́̊́̿͂͝͝͠͠o̸̧̨̢͙̬̜̲̗̜͎̓̇̿́͌͐̾͝ͅͅļ̶͍̟̹̩͚͇̋́̓ͅl̸̢̰̞͕̝̼̦̘̅͂̎̆̈́̓͝ͅī̵̤͚͆̓́̽̂́̿̓́̃͘͝ņ̶̨̛̬̣̙̐͗͑̑g̴̗͍͓̱̼͓͎̱͙͚̮͚͚̠̐';

    document.body.classList.toggle('glitch-shift', loopCount >= 8);

    navLinks.forEach(l => {
        l.classList.remove('active');
        if (loopCount >= 4) {
            const rot = (Math.random() * 18 - 9).toFixed(2);
            const skew = (Math.random() * 12 - 6).toFixed(2);
            const scale = 0.9 + Math.random() * 0.2;
            const letter = (Math.random() * 4 - 2).toFixed(2);
            l.style.transform = `rotate(${rot}deg) skew(${skew}deg) scale(${scale})`;
            l.style.letterSpacing = `${letter}px`;
            l.style.filter = 'blur(0.3px)';
        } else {
            l.style.transform = '';
            l.style.letterSpacing = '';
            l.style.filter = '';
        }
    });
    document.querySelector(`a[href="#${actId}"]`).classList.add('active');

    if (chaosOverlay) {
        chaosOverlay.querySelectorAll('.chaos-roman').forEach(el => {
            el.classList.toggle('active', el.dataset.act === actId);
        });
    }

    contentText.innerHTML = `
        ${loopCount >= 8 ? '' : `<h2>${data.title}</h2>`}
        <p class="${loopCount >= 8 ? 'glitch-move' : ''}">${loopCount >= 8 ? glitchText : data.text}</p>
    `;

    if (imageData.image) {
        featureImage.src = imageData.image;
        featureImage.setAttribute('data-act', imageActId);
        featureImage.classList.add('visible');
    } else {
        featureImage.classList.remove('visible');
    }
}

function randomBrightColor() {
    return `hsl(${Math.random() * 360}, 100%, 55%)`;
}

async function addSplatter() {
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
        const path = splatterSvgs[Math.floor(Math.random() * splatterSvgs.length)];
        if (!splatterCache[path]) {
            try {
                const res = await fetch(path);
                const text = await res.text();
                splatterCache[path] = text;
            } catch (err) {
                continue;
            }
        }
        const baseSvg = splatterCache[path];
        const color = randomBrightColor();
        const coloredSvg = baseSvg
            .replace(/fill="[^"]*"/g, `fill="${color}"`)
            .replace(/fill='[^']*'/g, `fill='${color}'`)
            .replace(/stop-color="[^"]*"/g, `stop-color="${color}"`)
            .replace(/stop-color='[^']*'/g, `stop-color='${color}'`);
        const splat = document.createElement('div');
        splat.classList.add('splatter');
        splat.style.setProperty('--splat-color', color);
        splat.style.color = color;
        const minSize = 50 + loopCount * 6;
        const maxSize = Math.min(520, 140 + loopCount * 12);
        const size = minSize + Math.random() * Math.max(20, maxSize - minSize);
        const top = Math.random() * (window.innerHeight - size * 0.5);
        const left = Math.random() * (window.innerWidth - size * 0.5);
        const rotation = Math.random() * 360;
        const scale = 0.7 + Math.random() * 1.3;
        splat.style.width = `${size}px`;
        splat.style.height = `${size}px`;
        splat.style.top = `${top}px`;
        splat.style.left = `${left}px`;
        splat.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        splat.innerHTML = coloredSvg;
        document.body.appendChild(splat);
    }
}

function showGameOver() {
    if (gameOver) return;
    gameOver = true;
    if (gameOverOverlay) {
        gameOverOverlay.style.display = 'flex';
    }
}

function handleLoopWrap() {
    if (gameOver) return;
    loopCount += 1;
    addSplatter();
    if (loopCount >= 4) {
        document.body.classList.add('distort');
    }
    if (loopCount >= GAME_OVER_AT) {
        showGameOver();
        return;
    }
    if (loopCount >= 7) {
        startAutoScroll();
    }
    if (loopCount >= 10) {
        ensureChaosOverlay();
    }
}

function doStep(direction, allowWhenGameOver = false) {
    if (gameOver && !allowWhenGameOver) return;
    const nextIndex = (currentActIndex + direction + acts.length) % acts.length;
    const wrappedForward = direction > 0 && currentActIndex === acts.length - 1;
    const wrappedBackward = direction < 0 && currentActIndex === 0;
    currentActIndex = nextIndex;
    if (wrappedForward || wrappedBackward) {
        handleLoopWrap();
    }
    updateAct(acts[currentActIndex]);
}

function fastLoop(direction) {
    if (fastLooping || gameOver) return;
    fastLooping = true;
    let steps = acts.length;
    const timer = setInterval(() => {
        if (gameOver) {
            clearInterval(timer);
            fastLooping = false;
            return;
        }
        doStep(direction);
        steps -= 1;
        if (steps <= 0) {
            clearInterval(timer);
            fastLooping = false;
        }
    }, 60);
}

function startAutoScroll() {
    if (autoScrollInterval) return;
    autoScrollInterval = setInterval(() => {
        doStep(1, true);
    }, 65);
}

let scrollTimeout;
window.addEventListener('wheel', (e) => {
    if (autoScrollInterval || gameOver) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (e.deltaY === 0 || fastLooping || gameOver) return;
        const direction = e.deltaY > 0 ? 1 : -1;
        if (loopCount >= 3) {
            fastLoop(direction);
        } else {
            doStep(direction);
        }
    }, 40);
});

updateAct('act1');
