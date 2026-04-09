/* INFO: Logika Sistem Web Panel ETERNALSMP - Final Integrated Version
   Fitur: SPA Navigation, Persistent Status, Real-time Simulation (30+ Players), 
   Discord Webhook Integration, & Chart.js Statistics.
*/

// --- STATE & PERSISTENCE ---
let serverStatus = localStorage.getItem('eternal_status') || 'online'; 
let logInterval;
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

const CHAT_POOL = [
    "GG EternalSMP!", "Ada yang punya iron lebih?", "Mabar cuy", "Lagi dimana?", 
    "Servernya asik banget", "Siapa yang mau trading?", "Awas ada creeper!", 
    "Bagi koordinat desa dong", "Season 15 keren parah", "Kapan event PVP?"
];

// --- INITIALIZATION ---
function seedPlayers() {
    // Memastikan saat start ada minimal 30-35 player agar terlihat ramai
    while(onlinePlayers.size < 32) {
        const p = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];
        onlinePlayers.add(p);
    }
}

// --- SISTEM NAVIGASI (SPA) ---
function showPage(pageId) {
    const sidebar = document.getElementById('sidebar');
    const consoleView = document.getElementById('console-view');
    const genericView = document.getElementById('generic-view');
    const headerContainer = document.getElementById('header-container');
    const actionButtons = document.getElementById('console-actions');
    const pageTitle = document.getElementById('page-title');
    const pageIcon = document.getElementById('page-icon');
    
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('data-page') === pageId) item.classList.add('active');
    });

    if (pageId === 'console') {
        headerContainer?.classList.remove('hidden');
        actionButtons?.classList.remove('hidden');
        consoleView.classList.remove('hidden');
        genericView.classList.add('hidden');
    } else {
        headerContainer?.classList.add('hidden');
        actionButtons?.classList.add('hidden');
        consoleView.classList.add('hidden');
        genericView.classList.remove('hidden');
        
        // Update Title & Icon Dynamic
        const formattedTitle = pageId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if(pageTitle) pageTitle.innerText = formattedTitle;
        
        const icons = { 
            'files': 'fa-folder-open', 'activity': 'fa-clock-rotate-left', 'databases': 'fa-database', 
            'network': 'fa-network-wired', 'users': 'fa-users', 'addons': 'fa-puzzle-piece', 
            'settings-server': 'fa-sliders', 'startup': 'fa-rocket'
        };
        if(pageIcon) pageIcon.className = `fa-solid ${icons[pageId] || 'fa-cube'} text-5xl text-blue-500 mb-4`;
    }
    if (window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
}

// --- LOGGING SYSTEM ---
function addLog(msg, type = "INFO") {
    const consoleEl = document.getElementById('console');
    if (!consoleEl) return;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const logLine = document.createElement('div');
    logLine.className = "mb-1 font-mono text-[13px] animate-in fade-in duration-300";
    logLine.innerHTML = `<span class="text-gray-500">[${time}] [Server thread/${type}]:</span> <span class="text-white">${msg}</span>`;
    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// --- DISCORD WEBHOOK ---
// --- DISCORD WEBHOOK (REVISED: No Online Count) ---
async function sendToDiscord(playerName, action, count, message = null) {
    // Menghilangkan baris [count online] agar lebih bersih
    let description = `**${playerName}**\n${action}`;
    if(message) description = `**<${playerName}>** ${message}\n\n*In-game Chat*`;

    const payload = {
        embeds: [{
            title: message ? "💬 EternalSMP Chat" : "⚡ Player Activity",
            description: description,
            color: message ? 1752220 : (action.includes("Joined") ? 3066993 : 15158332),
            timestamp: new Date().toISOString(),
            footer: { text: "EternalSMP Panel Live" }
        }]
    };
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) { console.error("Discord Hook Failed"); }
}

// --- SIMULASI AKTIVITAS (REVISED: Random Faster Intervals) ---
function startSimulation() {
    if (logInterval) clearTimeout(logInterval); 
    seedPlayers();

    const runRandomSimulation = () => {
        if(serverStatus !== 'online') return;

        const rand = Math.random();
        const onlineArray = Array.from(onlinePlayers);
        const randomPlayer = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];

        // Logika Maintain Populasi
        if (onlinePlayers.size < 30 || (rand < 0.1 && onlinePlayers.size < 80)) { 
            if (!onlinePlayers.has(randomPlayer)) {
                onlinePlayers.add(randomPlayer);
                addLog(`${randomPlayer} joined the game`, "INFO");
                sendToDiscord(randomPlayer, "Joined the game", onlinePlayers.size);
            }
        } 
        else if (rand < 0.15 && onlinePlayers.size > 30) { 
            const pToLeave = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            onlinePlayers.delete(pToLeave);
            addLog(`${pToLeave} left the game`, "INFO");
            sendToDiscord(pToLeave, "Left the game", onlinePlayers.size);
        } 
        else if (rand < 0.50) { // Chatting (Probabilitas sedikit ditingkatkan)
            const pChat = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            const msg = CHAT_POOL[Math.floor(Math.random() * CHAT_POOL.length)];
            addLog(`<${pChat}> ${msg}`, "INFO");
            if(Math.random() < 0.3) sendToDiscord(pChat, "", onlinePlayers.size, msg);
        }
        else { // System Stuff
            const sysLogs = ["Saving chunks for level 'world'", "TPS: 20.0 - MSPT: 12.5", "Automatic backup completed"];
            addLog(sysLogs[Math.floor(Math.random() * sysLogs.length)], "INFO");
        }

        updateVisualStats();

        // Penentuan waktu muncul berikutnya secara random (antara 1.5 detik hingga 6 detik)
        // Agar tidak membosankan dan terlihat lebih "real-time"
        const nextTick = Math.floor(Math.random() * (6000 - 1500 + 1)) + 1500;
        logInterval = setTimeout(runRandomSimulation, nextTick);
    };

    // Jalankan pertama kali
    logInterval = setTimeout(runRandomSimulation, 2000);
}

// --- CONTROL SERVER (REVISED: Clear Timeout) ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    if(action === 'start') {
        serverStatus = 'online';
        localStorage.setItem('eternal_status', 'online');
        if(dot) dot.className = "status-dot status-online";
        addLog("Starting Bedrock Server Engine...", "INFO");
        addLog("Opening port 25095...", "INFO");
        resetUptime(true);
        startSimulation();
    } else if(action === 'stop') {
        serverStatus = 'offline';
        localStorage.setItem('eternal_status', 'offline');
        if(dot) dot.className = "status-dot status-offline";
        addLog("Stopping server...", "WARN");
        onlinePlayers.clear();
        clearTimeout(logInterval); // Menggunakan clearTimeout karena sistem simulasi berubah
        resetUptime(false);
        const pDisplay = document.getElementById('player-online-text');
        if(pDisplay) pDisplay.innerText = "0 / 100";
    } else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 2000);
    }
}
// --- SIMULASI AKTIVITAS (HIGH DENSITY) ---
function startSimulation() {
    clearInterval(logInterval);
    seedPlayers();

    logInterval = setInterval(() => {
        if(serverStatus !== 'online') return;

        const rand = Math.random();
        const onlineArray = Array.from(onlinePlayers);
        const randomPlayer = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];

        // Logika Maintain Populasi (Min 30 Player)
        if (onlinePlayers.size < 30 || (rand < 0.1 && onlinePlayers.size < 80)) { 
            if (!onlinePlayers.has(randomPlayer)) {
                onlinePlayers.add(randomPlayer);
                addLog(`${randomPlayer} joined the game`, "INFO");
                sendToDiscord(randomPlayer, "Joined the game", onlinePlayers.size);
            }
        } 
        else if (rand < 0.15 && onlinePlayers.size > 30) { 
            const pToLeave = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            onlinePlayers.delete(pToLeave);
            addLog(`${pToLeave} left the game`, "INFO");
            sendToDiscord(pToLeave, "Left the game", onlinePlayers.size);
        } 
        else if (rand < 0.45) { // Chatting
            const pChat = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            const msg = CHAT_POOL[Math.floor(Math.random() * CHAT_POOL.length)];
            addLog(`<${pChat}> ${msg}`, "INFO");
            if(Math.random() < 0.3) sendToDiscord(pChat, "", onlinePlayers.size, msg);
        }
        else { // System Stuff
            const sysLogs = ["Saving chunks for level 'world'", "TPS: 20.0 - MSPT: 12.5", "Automatic backup completed"];
            addLog(sysLogs[Math.floor(Math.random() * sysLogs.length)], "INFO");
        }

        updateVisualStats();
    }, 4000);
}

// --- UI UPDATES & CHARTS ---
function updateVisualStats() {
    if(serverStatus !== 'online') return;
    const cpu = Math.floor(Math.random() * 20 + 10);
    const mem = Math.floor(Math.random() * 200 + 1240);
    
    if(cpuChart) updateChart(cpuChart, cpu);
    if(memChart) updateChart(memChart, (mem/4096)*100);
    if(netChart) updateChart(netChart, Math.random() * 40);
    
    const cpuTxt = document.getElementById('cpu-text');
    const memTxt = document.getElementById('mem-text');
    const pDisplay = document.getElementById('player-online-text');

    if(cpuTxt) cpuTxt.innerText = `${cpu}%`;
    if(memTxt) memTxt.innerText = `${mem} MiB`;
    if(pDisplay) pDisplay.innerText = `${onlinePlayers.size} / 100`;
}

function createChart(id, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: Array(20).fill(''), datasets: [{ data: Array(20).fill(0), borderColor: color, backgroundColor: color + '1A', fill: true, tension: 0.4, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: false }, scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } } }
    });
}

const cpuChart = createChart('cpuChart', '#3b82f6');
const memChart = createChart('memChart', '#22d3ee');
const netChart = createChart('netChart', '#ef4444');

function updateChart(chart, value) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
}

// --- CONTROL SERVER ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    if(action === 'start') {
        serverStatus = 'online';
        localStorage.setItem('eternal_status', 'online');
        if(dot) dot.className = "status-dot status-online";
        addLog("Starting Bedrock Server Engine...", "INFO");
        addLog("Opening port 25095...", "INFO");
        resetUptime(true);
        startSimulation();
    } else if(action === 'stop') {
        serverStatus = 'offline';
        localStorage.setItem('eternal_status', 'offline');
        if(dot) dot.className = "status-dot status-offline";
        addLog("Stopping server...", "WARN");
        onlinePlayers.clear();
        clearInterval(logInterval);
        resetUptime(false);
        const pDisplay = document.getElementById('player-online-text');
        if(pDisplay) pDisplay.innerText = "0 / 100";
    } else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 2000);
    }
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

// --- EVENT HANDLERS ---
document.getElementById('console-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        const cmd = this.value.trim();
        addLog(`EternalAdmin issued command: ${cmd}`, "INFO");
        if(cmd === "list") addLog(`Online (${onlinePlayers.size}): ${Array.from(onlinePlayers).join(', ')}`);
        this.value = '';
    }
});

// --- INIT ---
window.onload = () => {
    showPage('console');
    if(serverStatus === 'online') {
        controlServer('start');
    } else {
        const dot = document.getElementById('server-status-dot');
        if(dot) dot.className = "status-dot status-offline";
    }
};
