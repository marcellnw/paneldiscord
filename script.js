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
