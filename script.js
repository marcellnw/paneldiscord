// INFO: Global Variables & State
let serverStatus = 'online'; // online, offline, starting
const consoleEl = document.getElementById('console');
let logInterval;
let startTime = Date.now();
let uptimeInterval;

// --- INFO: UPTIME SYSTEM ---
function updateUptimeDisplay() {
    if (serverStatus !== 'online') return;
    
    const now = Date.now();
    const diff = now - startTime;
    
    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / (1000 * 60)) % 60;
    const h = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    document.getElementById('uptime-text').innerText = `${d}d ${h}h ${m}m ${s}s`;
}

function resetUptime(isStarting = true) {
    clearInterval(uptimeInterval);
    if (isStarting) {
        startTime = Date.now();
        uptimeInterval = setInterval(updateUptimeDisplay, 1000);
    } else {
        document.getElementById('uptime-text').innerText = "0d 0h 0m 0s";
    }
}

// --- INFO: TOP BAR FUNCTIONS ---
function triggerSearch() {
    const query = prompt("Search files, logs or settings:");
    if(query) addLog(`Searching for: "${query}"...`, "INFO");
}

function toggleUserMenu() {
    alert("User Profile: Iko Siswono\nRole: Administrator\nStatus: Active");
}

// --- INFO: NAVIGATION SYSTEM ---
function showPage(pageId) {
    const consoleView = document.getElementById('console-view');
    const otherPages = document.getElementById('other-pages');
    const pageTitle = document.getElementById('page-title');
    const pageIcon = document.getElementById('page-icon');

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');

    if(pageId === 'console') {
        consoleView.classList.remove('hidden');
        otherPages.classList.add('hidden');
    } else {
        consoleView.classList.add('hidden');
        otherPages.classList.remove('hidden');
        pageTitle.innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
        const icons = { 'files': 'fa-file', 'activity': 'fa-clock-rotate-left', 'databases': 'fa-database', 'network': 'fa-network-wired', 'users': 'fa-users', 'addons': 'fa-puzzle-piece', 'optimization': 'fa-bolt' };
        pageIcon.className = `fa-solid ${icons[pageId] || 'fa-cube'} text-5xl text-blue-500 mb-4`;
    }
}

// --- INFO: SERVER CONTROL LOGIC ---
function controlServer(action) {
    const dot = document.getElementById('server-status-dot');
    
    if(action === 'start') {
        if(serverStatus === 'online' || serverStatus === 'starting') return;
        serverStatus = 'starting';
        dot.className = "status-dot status-starting";
        
        let startSequence = [
            "Checking storage integrity...", "Allocating 4GB RAM...", 
            "Mounting virtual disk...", "Fetching latest jar...",
            "Starting OpenJDK 17...", "Loading libraries...",
            "Applying optimization patches...", "Finalizing environment..."
        ];
        
        startSequence.forEach((msg, i) => {
            setTimeout(() => addLog(msg, "INFO"), i * 150);
        });

        setTimeout(() => {
            serverStatus = 'online';
            dot.className = "status-dot status-online";
            addLog("Server marked as RUNNING", "SUCCESS");
            resetUptime(true);
            startLiveLogs(800);
        }, 1500);
    } 
    else if(action === 'stop') {
        if(serverStatus === 'offline') return;
        serverStatus = 'offline';
        dot.className = "status-dot status-offline";
        addLog("Stopping server gracefully...", "INFO");
        addLog("Saving chunks and closing databases", "INFO");
        addLog("Server stopped.", "DANGER");
        clearInterval(logInterval);
        resetUptime(false);
    } 
    else if(action === 'restart') {
        controlServer('stop');
        setTimeout(() => controlServer('start'), 1000);
    }
}

// --- INFO: CONSOLE LOGIC ---
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
        "Player logged in: EternalAdmin",
        "Saving world level...",
        "Running garbage collector (freed 45MB)",
        "Updating plugin: EpicKnights v3.2",
        "New land claim created at [241, 64, -102]",
        "Auto-backup completed successfully",
        "TPS: 20.0 (100%)",
        "Loading entity data...",
        "Chunk [12, -5] generated"
    ];
    logInterval = setInterval(() => {
        if(serverStatus === 'online') {
            const msg = randomLogs[Math.floor(Math.random() * randomLogs.length)];
            addLog(msg, "INFO");
        }
    }, ms);
}

document.getElementById('console-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        addLog(this.value, "USER");
        this.value = '';
    }
});

// --- INFO: CHARTS LOGIC ---
function createChart(id, color) {
    const ctx = document.getElementById(id).getContext('2d');
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
        const cpu = Math.floor(Math.random() * 25 + 10);
        const mem = Math.floor(Math.random() * 200 + 800);
        const net = (Math.random() * 5).toFixed(2);
        
        updateChart(cpuChart, cpu);
        updateChart(memChart, (mem/4000)*100);
        updateChart(netChart, Math.random() * 80);

        document.getElementById('cpu-text').innerText = `${cpu}% / 200%`;
        document.getElementById('mem-text').innerText = `${mem} MiB / 3.91 GiB`;
        document.getElementById('net-text').innerText = `↑ ${net} MiB/s`;
    } else {
        updateChart(cpuChart, 0);
        updateChart(memChart, 0);
        updateChart(netChart, 0);
        document.getElementById('cpu-text').innerText = `0%`;
        document.getElementById('mem-text').innerText = `0 MiB`;
        document.getElementById('net-text').innerText = `0 MiB`;
    }
}, 1000);

function updateChart(chart, value) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
}

// INFO: Sidebar Mobile Toggle
document.getElementById('mobile-menu-btn').onclick = () => {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
};

// INFO: Initialization on Load
window.onload = () => {
    addLog("Container checked and ready.", "INFO");
    addLog("Connecting to JKT-NODE-05...", "INFO");
    resetUptime(true);
    startLiveLogs(1200);
};
