/* INFO: Logika Sistem Web Panel
   Menangani navigasi SPA, kontrol server, sistem terminal, dan grafik statistik.
*/

let serverStatus = 'online'; 
let logInterval;
let startTime = Date.now();
let uptimeInterval;

// Referensi DOM Global
const sidebar = document.getElementById('sidebar');
const consoleEl = document.getElementById('console');
const headerContainer = document.getElementById('header-container');
const actionButtons = document.getElementById('console-actions');

// --- SISTEM NAVIGASI (SPA) ---
function showPage(pageId) {
    const consoleView = document.getElementById('console-view');
    const genericView = document.getElementById('generic-view');
    const pageTitle = document.getElementById('page-title');
    const pageIcon = document.getElementById('page-icon');

    // Update Sidebar UI
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('data-page') === pageId) item.classList.add('active');
    });

    // Logika Visibilitas (Header & Tombol HANYA di Console)
    if (pageId === 'console') {
        headerContainer.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        consoleView.classList.remove('hidden');
        genericView.classList.add('hidden');
    } else {
        headerContainer.classList.add('hidden'); // Sembunyikan Header Info
        actionButtons.classList.add('hidden');    // Sembunyikan Kontrol
        consoleView.classList.add('hidden');
        genericView.classList.remove('hidden');
        
        // Update Metadata Menu
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
    
    // Auto-close sidebar on mobile
    if (window.innerWidth < 1024) sidebar.classList.add('-translate-x-full');
}

// --- KONTROL SERVER ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    
    if(action === 'start') {
        if(serverStatus === 'online' || serverStatus === 'starting') return;
        serverStatus = 'starting';
        dot.className = "status-dot status-starting";
        
        const startSequence = [
            "Initializing virtual environment...", "Checking file system...", 
            "Allocating resources...", "Starting Minecraft Server...",
            "Loading world 'EternalSeason15'...", "Applying optimization patches..."
        ];
        
        startSequence.forEach((msg, i) => setTimeout(() => addLog(msg, "INFO"), i * 200));

        setTimeout(() => {
            serverStatus = 'online';
            dot.className = "status-dot status-online";
            addLog("Server successfully started on port 25095", "SUCCESS");
            resetUptime(true);
            startLiveLogs(1000);
        }, 1800);
    } 
    else if(action === 'stop') {
        if(serverStatus === 'offline') return;
        serverStatus = 'offline';
        dot.className = "status-dot status-offline";
        addLog("Shutdown signal received.", "WARN");
        addLog("Saving world data and stopping threads...", "INFO");
        addLog("Server process terminated.", "DANGER");
        clearInterval(logInterval);
        resetUptime(false);
    } 
    else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 1500);
    }
}

// --- TERMINAL & LOGS ---
function addLog(msg, type = "INFO") {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const colors = { "INFO": "text-blue-500", "SUCCESS": "text-emerald-500", "WARN": "text-yellow-500", "DANGER": "text-red-500", "USER": "text-white" };
    const logLine = document.createElement('div');
    logLine.className = "mb-1 animate-in fade-in duration-300";
    logLine.innerHTML = `<span class="text-gray-600 mr-2">[${time}]</span> <span class="${colors[type]} font-bold">${type}</span>: ${msg}`;
    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function startLiveLogs(ms = 3000) {
    clearInterval(logInterval);
    const randomLogs = [
        "Player logged in: Iko_Siswono", "TPS: 20.0 (STABLE)", "Chunk GC: freed 1204 chunks",
        "Auto-saving world...", "User EternalAdmin issued command: /tps", "Database sync completed"
    ];
    logInterval = setInterval(() => {
        if(serverStatus === 'online') {
            const msg = randomLogs[Math.floor(Math.random() * randomLogs.length)];
            addLog(msg, "INFO");
        }
    }, ms);
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

setInterval(() => {
    if(serverStatus === 'online') {
        const cpu = Math.floor(Math.random() * 15 + 5);
        const mem = Math.floor(Math.random() * 100 + 900);
        if(cpuChart) updateChart(cpuChart, cpu);
        if(memChart) updateChart(memChart, (mem/4096)*100);
        if(netChart) updateChart(netChart, Math.random() * 50);
        
        const cpuTxt = document.getElementById('cpu-text');
        const memTxt = document.getElementById('mem-text');
        if(cpuTxt) cpuTxt.innerText = `${cpu}%`;
        if(memTxt) memTxt.innerText = `${mem} MiB`;
    }
}, 1000);

function updateChart(chart, value) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
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

// Event Listeners
document.getElementById('console-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        addLog(this.value, "USER");
        this.value = '';
    }
});

document.getElementById('mobile-menu-btn').onclick = () => sidebar.classList.toggle('-translate-x-full');

function triggerSearch() { alert("Search feature initialized..."); }
function toggleUserMenu() { alert("Admin Profile: Iko Siswono"); }

window.onload = () => {
    addLog("System environment ready.", "INFO");
    resetUptime(true);
    startLiveLogs(1500);
    showPage('console'); // Pastikan console tampil pertama kali
};

/* INFO: Logika Sistem Web Panel ETERNALSMP
   Menangani navigasi SPA, kontrol server, sistem terminal Bedrock, dan Discord Webhook.
*/

let serverStatus = 'online'; 
let logInterval;
let discordInterval;
let startTime = Date.now();
let onlinePlayers = new Set(); // Menyimpan daftar player yang sedang online

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

// --- FORMAT LOG BEDROCK ---
function addLog(msg, type = "INFO") {
    const consoleEl = document.getElementById('console');
    if (!consoleEl) return;

    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const logLine = document.createElement('div');
    logLine.className = "mb-1 font-mono text-[13px]";
    
    // Format Bedrock: [HH:MM:SS] [Server thread/INFO]: message
    logLine.innerHTML = `<span class="text-gray-500">[${time}] [Server thread/${type}]:</span> <span class="text-white">${msg}</span>`;
    
    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// --- DISCORD WEBHOOK (EMBED FORMAT) ---
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

// --- SIMULASI AKTIVITAS PLAYER ---
function startPlayerSimulation() {
    clearInterval(logInterval);
    clearInterval(discordInterval);

    // Interval Log Console (Cepat)
    logInterval = setInterval(() => {
        if(serverStatus !== 'online') return;

        const rand = Math.random();
        const player = PLAYER_POOL[Math.floor(Math.random() * PLAYER_POOL.length)];

        if (rand < 0.1) { // Join
            if (!onlinePlayers.has(player)) {
                onlinePlayers.add(player);
                addLog(`${player} joined the game`, "INFO");
            }
        } else if (rand < 0.15 && onlinePlayers.size > 0) { // Leave
            const p = Array.from(onlinePlayers)[0];
            onlinePlayers.delete(p);
            addLog(`${p} left the game`, "INFO");
        } else if (rand < 0.4 && onlinePlayers.size > 0) { // Activity
            const p = Array.from(onlinePlayers)[Math.floor(Math.random() * onlinePlayers.size)];
            const acts = ["mining diamonds", "exploring cave", "fighting mobs", "level up mining"];
            addLog(`${p} reached ${acts[Math.floor(Math.random() * acts.length)]}`, "INFO");
        } else {
            const system = ["Saving chunks for level 'world'", "Syncing player data...", "Average TPS: 20.0"];
            addLog(system[Math.floor(Math.random() * system.length)], "INFO");
        }
    }, 4000);

    // Interval Discord (30 Detik Sekali)
    discordInterval = setInterval(() => {
        if(serverStatus === 'online' && onlinePlayers.size > 0) {
            const player = Array.from(onlinePlayers)[0];
            sendToDiscord(player, "Player Join", onlinePlayers.size);
        }
    }, 30000);
}

// --- CONTROL SERVER ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    if(action === 'start') {
        serverStatus = 'starting';
        dot.className = "status-dot status-starting";
        addLog("Initializing environment...", "INFO");
        setTimeout(() => {
            addLog("Loading world 'EternalSeason15'...", "INFO");
            addLog("Server started on port 25095", "INFO");
            serverStatus = 'online';
            dot.className = "status-dot status-online";
            startPlayerSimulation();
        }, 2000);
    } else if(action === 'stop') {
        serverStatus = 'offline';
        dot.className = "status-dot status-offline";
        addLog("Saving data...", "INFO");
        addLog("Server stopped.", "INFO");
        onlinePlayers.clear();
        clearInterval(logInterval);
        clearInterval(discordInterval);
    } else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 2000);
    }
}

// --- COMMAND SYSTEM (CONSOLE) ---
document.getElementById('console-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        const cmd = this.value.trim();
        // Simulasi respon tanpa "/"
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

// Inisialisasi awal
window.onload = () => {
    showPage('console');
    controlServer('start');
};
