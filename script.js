const planner = document.getElementById('planner');
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const saveSettings = document.getElementById('save-settings');
const sleepStartInput = document.getElementById('sleep-start');
const sleepEndInput = document.getElementById('sleep-end');

const BLOCKS_PER_HOUR = 4;
const MINUTES_PER_BLOCK = 15;

function loadSettings() {
    const savedStart = localStorage.getItem('sleepStart') || '02:00';
    const savedEnd = localStorage.getItem('sleepEnd') || '10:00';
    sleepStartInput.value = savedStart;
    sleepEndInput.value = savedEnd;
    return {
        start: parseInt(savedStart.split(':')[0]),
        end: parseInt(savedEnd.split(':')[0])
    };
}

function saveCurrentSettings() {
    localStorage.setItem('sleepStart', sleepStartInput.value);
    localStorage.setItem('sleepEnd', sleepEndInput.value);
    createPlanner();
}

function getCurrentBlockIndex() {
    const now = new Date();
    const sleepHours = loadSettings();
    let hours = now.getHours();

    // Adjust hours relative to sleep start time
    if (hours < sleepHours.start) {
        hours += 24;
    }
    hours -= sleepHours.start;

    return hours * BLOCKS_PER_HOUR + Math.floor(now.getMinutes() / MINUTES_PER_BLOCK);
}

function formatHour(hour) {
    return `${(hour % 24).toString().padStart(2, '0')}:00`;
}

function createBlock(hour, blockIndex, currentBlockIndex) {
    const block = document.createElement('div');
    block.className = 'block';
    const sleepHours = loadSettings();
    const normalizedHour = hour - sleepHours.start;
    const key = `planner-${hour % 24}-${blockIndex}`;
    const absoluteBlockIndex = normalizedHour * BLOCKS_PER_HOUR + blockIndex;

    if (absoluteBlockIndex < currentBlockIndex) {
        block.classList.add('past');
    }

    const currentHour = hour % 24;
    if (currentHour >= sleepHours.start && currentHour < sleepHours.end) {
        block.classList.add('sleep');
    }
    if (absoluteBlockIndex === currentBlockIndex) {
        block.classList.add('current');
    }

    if (localStorage.getItem(key) === '1') {
        block.classList.add('active');
    }

    block.addEventListener('click', () => {
        block.classList.toggle('active');
        localStorage.setItem(key, block.classList.contains('active') ? '1' : '0');
    });

    return block;
}

function createPlanner() {
    planner.innerHTML = '';
    const currentBlockIndex = getCurrentBlockIndex();
    const sleepHours = loadSettings();
    const HOUR_SHIFT = sleepHours.start;
    for (let hour = HOUR_SHIFT; hour < 24 + HOUR_SHIFT; hour++) {
        const hourRow = document.createElement('div');
        hourRow.className = 'hour-row';

        const label = document.createElement('div');
        label.className = 'hour-label';
        label.textContent = formatHour(hour);
        hourRow.appendChild(label);

        const blockRow = document.createElement('div');
        blockRow.className = 'block-row';

        for (let i = 0; i < BLOCKS_PER_HOUR; i++) {
            const block = createBlock(hour, i, currentBlockIndex);


            blockRow.appendChild(block);
        }

        hourRow.appendChild(blockRow);
        planner.appendChild(hourRow);
    }
}

// Event listeners for settings
settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
});

saveSettings.addEventListener('click', () => {
    saveCurrentSettings();
    settingsPanel.classList.remove('open');
});

// Initialize
loadSettings();
createPlanner();
setInterval(createPlanner, 60000);