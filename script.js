/* INFO: Logika Sistem Web Panel ETERNALSMP 
   Menangani navigasi SPA, kontrol server, sistem terminal Bedrock, 
   statistik grafik, dan Discord Webhook.
*/

let serverStatus = 'online'; 
let logInterval;
let discordInterval; // Tetap dideklarasikan untuk kompatibilitas, meski sekarang pemicu Discord berbasis event
let uptimeInterval;
let startTime = Date.now();
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

// --- SISTEM NAVIGASI (SPA) ---
function showPage(pageId) {
    const sidebar = document.getElementById('sidebar');
    const consoleView = document.getElementById('console-view');
    const genericView = document.getElementById('generic-view');
    const pageTitle = document.getElementById('page-title');
    const pageIcon = document.getElementById('page-icon');
    const headerContainer = document.getElementById('header-container');
    const actionButtons = document.getElementById('console-actions');

    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('data-page') === pageId) item.classList.add('active');
    });

    if (pageId === 'console') {
        headerContainer.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        consoleView.classList.remove('hidden');
        genericView.classList.add('hidden');
    } else {
        headerContainer.classList.add('hidden');
        actionButtons.classList.add('hidden');
        consoleView.classList.add('hidden');
        genericView.classList.remove('hidden');
        
        const formattedTitle = pageId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        pageTitle.innerText = formattedTitle;
        
        const icons = { 
            'files': 'fa-folder-open', 'activity': 'fa-clock-rotate-left', 'databases': 'fa-database', 
            'network': 'fa-network-wired', 'users': 'fa-users', 'addons': 'fa-puzzle-piece', 
            'optimization': 'fa-bolt', 'software': 'fa-layer-group', 'schedules': 'fa-calendar-days',
            'backups': 'fa-file-shield', 'proxy': 'fa-shield-halved', 'icon': 'fa-image',
            'config': 'fa-gears', 'players': 'fa-user-shield', 'versions': 'fa-code-branch',
            'startup': 'fa-rocket', 'git': 'fa-brands fa-git-alt', 'settings-dev': 'fa-wrench',
            'settings-server': 'fa-sliders', 'split': 'fa-arrows-split-up-and-left',
            'env': 'fa-flask', 'subdomain': 'fa-link'
        };
        pageIcon.className = `fa-solid ${icons[pageId] || 'fa-cube'} text-5xl text-blue-500 mb-4`;
    }
    
    if (window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
}

// --- FORMAT LOG BEDROCK ---
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
async function sendToDiscord(playerName, action, count) {
    const payload = {
        embeds: [{
            title: "Player Activity Log",
            description: `**${playerName}**\n${action}\n\n*${playerName} ${action.toLowerCase()} the server*\n**[${count} online]**`,
            color: action === "Player Join" ? 3066993 : 15158332,
            timestamp: new Date().toISOString(),
            footer: { text: "EternalSMP Live Monitor" }
        }]
    };
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) { console.error("Webhook Error"); }
}

// --- SIMULASI AKTIVITAS & STATS (AKURAT) ---
function startSimulation() {
    clearInterval(logInterval);
    clearInterval(discordInterval);

    logInterval = setInterval(() => {
        if(serverStatus !== 'online') return;

        const rand = Math.random();
        const randomPlayer = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];
        const onlineArray = Array.from(onlinePlayers);

        // LOGIKA JOIN
        if (rand < 0.1) { 
            if (!onlinePlayers.has(randomPlayer)) {
                onlinePlayers.add(randomPlayer);
                addLog(`${randomPlayer} joined the game`, "INFO");
                sendToDiscord(randomPlayer, "Player Join", onlinePlayers.size);
            }
        } 
        // LOGIKA LEAVE (Hanya player yang online yang bisa leave)
        else if (rand < 0.15 && onlineArray.length > 0) { 
            const playerToLeave = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            onlinePlayers.delete(playerToLeave);
            addLog(`${playerToLeave} left the game`, "INFO");
            sendToDiscord(playerToLeave, "Player Leave", onlinePlayers.size);
        } 
        // LOGIKA AKTIVITAS (Hanya player yang online yang melakukan aktivitas)
        else if (rand < 0.4 && onlineArray.length > 0) { 
            const activePlayer = onlineArray[Math.floor(Math.random() * onlineArray.length)];
            const acts = ["mining diamonds", "exploring cave", "fighting mobs", "level up mining"];
            addLog(`${activePlayer} reached ${acts[Math.floor(Math.random() * acts.length)]}`, "INFO");
        } 
        // LOGIKA SISTEM
        else {
            const system = ["Saving chunks for level 'world'", "Syncing player data...", "Average TPS: 20.0"];
            addLog(system[Math.floor(Math.random() * system.length)], "INFO");
        }

        // Update Statistik Visual & Grafik
        updateVisualStats();

    }, 3000);
}

// Fungsi bantu untuk memperbarui Grafik dan Teks di UI
function updateVisualStats() {
    if(serverStatus !== 'online') return;

    const cpu = Math.floor(Math.random() * 15 + 5);
    const mem = Math.floor(Math.random() * 100 + 900);
    
    if(cpuChart) updateChart(cpuChart, cpu);
    if(memChart) updateChart(memChart, (mem/4096)*100);
    if(netChart) updateChart(netChart, Math.random() * 50);
    
    const cpuTxt = document.getElementById('cpu-text');
    const memTxt = document.getElementById('mem-text');
    const playerTxt = document.getElementById('player-online-text'); // Gunakan ID ini untuk jumlah player

    if(cpuTxt) cpuTxt.innerText = `${cpu}%`;
    if(memTxt) memTxt.innerText = `${mem} MiB`;
    if(playerTxt) playerTxt.innerText = `${onlinePlayers.size} / 100`;
}

// --- STATS SYSTEM (CHART.JS) ---
function createChart(id, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: Array(20).fill(0),
                borderColor: color,
                borderWidth: 2,
                fill: true,
                backgroundColor: color.replace('1)', '0.1)'),
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } }
        }
    });
}

const cpuChart = createChart('cpuChart', 'rgba(59, 130, 246, 1)');
const memChart = createChart('memChart', 'rgba(34, 211, 238, 1)');
const netChart = createChart('netChart', 'rgba(239, 68, 68, 1)');

function updateChart(chart, value) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
}

// --- CONTROL SERVER ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    if(action === 'start') {
        if(serverStatus === 'online') return;
        serverStatus = 'starting';
        dot.className = "status-dot status-starting";
        addLog("Initializing environment...", "INFO");
        setTimeout(() => {
            addLog("Loading world 'EternalSeason15'...", "INFO");
            addLog("Server started on port 25095", "INFO");
            serverStatus = 'online';
            dot.className = "status-dot status-online";
            resetUptime(true);
            startSimulation();
        }, 2000);
    } else if(action === 'stop') {
        serverStatus = 'offline';
        dot.className = "status-dot status-offline";
        addLog("Shutdown signal received.", "WARN");
        addLog("Server stopped.", "INFO");
        onlinePlayers.clear();
        clearInterval(logInterval);
        resetUptime(false);
        // Reset player display
        const pTxt = document.getElementById('player-online-text');
        if(pTxt) pTxt.innerText = "0 / 100";
    } else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 2000);
    }
}

// --- UTILS ---
function resetUptime(isStarting) {
    clearInterval(uptimeInterval);
    const upt = document.getElementById('uptime-text');
    if (isStarting) {
        startTime = Date.now();
        uptimeInterval = setInterval(() => {
            const diff = Date.now() - startTime;
            const s = Math.floor(diff / 1000) % 60;
            const m = Math.floor(diff / (1000 * 60)) % 60;
            const h = Math.floor(diff / (1000 * 60 * 60)) % 24;
            if(upt) upt.innerText = `0d ${h}h ${m}m ${s}s`;
        }, 1000);
    } else {
        if(upt) upt.innerText = "0d 0h 0m 0s";
    }
}

// --- COMMAND SYSTEM ---
document.getElementById('console-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        const cmd = this.value.trim();
        addLog(`User EternalAdmin issued server command: ${cmd}`, "INFO");
        if(cmd === "list") {
            addLog(`There are ${onlinePlayers.size} players online: ${Array.from(onlinePlayers).join(', ')}`, "INFO");
        } else if (cmd.startsWith("op ")) {
            addLog(`Opped ${cmd.split(' ')[1]}`, "INFO");
        } else if (cmd === "seed") {
            addLog(`Seed: [5829301129384]`, "INFO");
        }
        this.value = '';
    }
});

// Event UI Lainnya
document.getElementById('mobile-menu-btn').onclick = () => document.getElementById('sidebar').classList.toggle('-translate-x-full');
function triggerSearch() { alert("Search feature initialized..."); }
function toggleUserMenu() { alert("Admin Profile: Iko Siswono"); }

// Inisialisasi awal
window.onload = () => {
    showPage('console');
    controlServer('start');
};
