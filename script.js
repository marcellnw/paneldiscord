/* INFO: Logika Sistem Web Panel ETERNALSMP - Optimized Version
   Fitur: SPA Navigation, Persistent Status, Real-time Simulation (Join/Leave Only), 
   Clean Discord Webhook, & Automatic Log Management.
*/

// --- STATE & PERSISTENCE ---
let serverStatus = localStorage.getItem('eternal_status') || 'online'; 
let logTimeout;
let uptimeInterval;
let startTime = parseInt(localStorage.getItem('eternal_startTime')) || Date.now();
let onlinePlayers = new Set(); 

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1491637769468907621/ItuJvO9EwusKDxWCG6eA9BYw1hGYrnhfKyffmMt6FPH7WZKfIjH3Z43fU4NSDSdv1xkj";

const PLAYER_POOL = [
    "Chillatomboy", "AldianGG", "Lackykz", "Reza3487", "vexevitrix", "Svennnz",
    "FuraChan7332", "Noi nge sad", "Arjuna5222", "Nohanniiel", "Fayynx01",
    "ZANMODE", "Yaanviee5033", "Mytsukizon", "D4rkxCraftt", "keyzzz",
    "EryezetNoKai", "DigiCraft4120", "ItzGreetaa", "Schannx", "LYvanvin",
    "REXDI9421", "MythXenn", "SchDxion", "OutCaster3827", "NishhCH",
    "Alansyah77", "SkynicSC", "Aerztwin", "XennN6298", "LordDean2663",
    "Somekk07", "azkA244444444", "IxSouw", "Aileen3112", "Chisaki17",
    "AsankaAzra", "ABYSSLIME9684", "MythHoloo", "JosKelvin", "AnimalYapper164",
    "MyPinn", "Merperr99", "Kazzuya2007", "QueennnzMe", "Afdanzzzz",
    "sunnyic7947", "PudingBeku", "AmiiLunaa", "Awaaadesu3", "KHOIRULLLGMG",
    "AdilPorphyr", "Zaxs", "Chyntia136", "Alfaln0", "Bobby98257",
    "Jinoo77", "Primmbee", "Nyctotenz", "zenaaa03", "Notsmile1122",
    "Sheptian159", "Azkii3394", "FadilAzrial70", "TRIXIER24"
];

// --- INITIALIZATION ---
function seedPlayers() {
    while(onlinePlayers.size < 32) {
        const p = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];
        onlinePlayers.add(p);
    }
}

// --- LOGGING SYSTEM (Optimized with DOM Management) ---
function addLog(msg, type = "INFO") {
    const consoleEl = document.getElementById('console');
    if (!consoleEl) return;
    
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const logLine = document.createElement('div');
    logLine.className = "mb-1 font-mono text-[13px] animate-in fade-in duration-200";
    logLine.innerHTML = `<span class="text-gray-500">[${time}] [Server thread/${type}]:</span> <span class="text-white">${msg}</span>`;
    
    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    if (consoleEl.childNodes.length > 100) {
        consoleEl.removeChild(consoleEl.firstChild);
    }
}

// --- DISCORD WEBHOOK (Prose Only - Join/Leave) ---
function sendToDiscord(playerName, action) {
    const payload = {
        embeds: [{
            title: "Player Activity",
            description: `**${playerName}** ${action.toLowerCase()}`,
            color: action.includes("Joined") ? 3066993 : 15158332,
            timestamp: new Date().toISOString(),
            footer: { text: "EternalSMP System Monitor" }
        }]
    };

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => {}); 
}

// --- SIMULASI AKTIVITAS (Hanya Join/Leave & System) ---
function startSimulation() {
    if (logTimeout) clearTimeout(logTimeout);
    seedPlayers();

    const runSimulation = () => {
        if(serverStatus !== 'online') return;

        const rand = Math.random();
        const onlineArray = Array.from(onlinePlayers);
        const randomPlayer = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];

        // 1. Aktivitas Player (Webhook Aktif)
        if (rand < 0.07) { 
            if (!onlinePlayers.has(randomPlayer)) {
                onlinePlayers.add(randomPlayer);
                addLog(`${randomPlayer} joined the game`, "INFO");
                sendToDiscord(randomPlayer, "Joined the game");
            }
        } 
        else if (rand < 0.12 && onlinePlayers.size > 30) { 
            const pToLeave = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            onlinePlayers.delete(pToLeave);
            addLog(`${pToLeave} left the game`, "INFO");
            sendToDiscord(pToLeave, "Left the game");
        } 
        // 2. Aktivitas Sistem (Hanya di Konsol - Webhook Tidak Aktif)
        else {
            const sysLogs = [
                "Saving chunks for level 'world'",
                "Average TPS: 20.0 (100%)",
                "Successfully synced player data with database",
                "Performing routine memory cleanup...",
                "Searching for outdated chunks...",
                "Database connection: Stable",
                "Cleaning up leaked memory objects...",
                "Server tick took 12.5ms"
            ];
            addLog(sysLogs[Math.floor(Math.random() * sysLogs.length)], "INFO");
        }

        updateVisualStats();

        const nextTick = Math.floor(Math.random() * 2700) + 800;
        logTimeout = setTimeout(runSimulation, nextTick);
    };

    runSimulation();
}

// --- CONTROL SERVER ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    if(action === 'start') {
        serverStatus = 'online';
        localStorage.setItem('eternal_status', 'online');
        if(dot) dot.className = "status-dot status-online";
        addLog("Starting Bedrock Server Engine...", "INFO");
        addLog("Server opened on port 25095", "INFO");
        resetUptime(true);
        startSimulation();
    } else if(action === 'stop') {
        serverStatus = 'offline';
        localStorage.setItem('eternal_status', 'offline');
        if(dot) dot.className = "status-dot status-offline";
        addLog("Server shutdown initiated.", "WARN");
        onlinePlayers.clear();
        clearTimeout(logTimeout);
        resetUptime(false);
        const pDisplay = document.getElementById('player-online-text');
        if(pDisplay) pDisplay.innerText = "0 / 100";
    } else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 1500);
    }
}

// --- UI UPDATES & UPTIME ---
function updateVisualStats() {
    if(serverStatus !== 'online') return;
    const cpu = Math.floor(Math.random() * 12 + 4);
    const mem = Math.floor(Math.random() * 150 + 1100);
    
    if(window.cpuChart) updateChart(cpuChart, cpu);
    if(window.memChart) updateChart(memChart, (mem/4096)*100);
    
    const cpuTxt = document.getElementById('cpu-text');
    const memTxt = document.getElementById('mem-text');
    const pDisplay = document.getElementById('player-online-text');

    if(cpuTxt) cpuTxt.innerText = `${cpu}%`;
    if(memTxt) memTxt.innerText = `${mem} MiB`;
    if(pDisplay) pDisplay.innerText = `${onlinePlayers.size} / 100`;
}

function updateChart(chart, value) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
}

function resetUptime(start) {
    clearInterval(uptimeInterval);
    const uptTxt = document.getElementById('uptime-text');
    if (start) {
        if(!localStorage.getItem('eternal_startTime')) {
            startTime = Date.now();
            localStorage.setItem('eternal_startTime', startTime);
        }
        uptimeInterval = setInterval(() => {
            const diff = Date.now() - startTime;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            if(uptTxt) uptTxt.innerText = `0d ${h}h ${m}m ${s}s`;
        }, 1000);
    } else {
        localStorage.removeItem('eternal_startTime');
        if(uptTxt) uptTxt.innerText = "0d 0h 0m 0s";
    }
}

window.onload = () => {
    if(typeof showPage === 'function') showPage('console');
    if(serverStatus === 'online') {
        controlServer('start');
    } else {
        const dot = document.getElementById('server-status-dot');
        if(dot) dot.className = "status-dot status-offline";
    }
};
