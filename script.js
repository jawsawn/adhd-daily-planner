// Constants
const CONSTANTS = {
    BLOCKS_PER_HOUR: 4,
    MINUTES_PER_BLOCK: 15,
    DEFAULT_SLEEP_START: '02:00',
    DEFAULT_SLEEP_END: '10:00',
    UPDATE_INTERVAL: 60000 // 1 minute in milliseconds
};

// DOM Elements
const elements = {
    planner: document.getElementById('planner'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsToggle: document.getElementById('settings-toggle'),
    saveSettings: document.getElementById('save-settings'),
    sleepStartInput: document.getElementById('sleep-start'),
    sleepEndInput: document.getElementById('sleep-end')
};

// Settings Management
class Settings {
    static load() {
        const savedStart = localStorage.getItem('sleepStart') || CONSTANTS.DEFAULT_SLEEP_START;
        const savedEnd = localStorage.getItem('sleepEnd') || CONSTANTS.DEFAULT_SLEEP_END;

        elements.sleepStartInput.value = savedStart;
        elements.sleepEndInput.value = savedEnd;

        return {
            start: parseInt(savedStart.split(':')[0]),
            end: parseInt(savedEnd.split(':')[0])
        };
    }

    static save() {
        localStorage.setItem('sleepStart', elements.sleepStartInput.value);
        localStorage.setItem('sleepEnd', elements.sleepEndInput.value);
    }
}

// Time Management
class TimeManager {
    static getCurrentBlockIndex() {
        const now = new Date();
        const sleepHours = Settings.load();
        let hours = now.getHours();

        if (hours < sleepHours.start) {
            hours += 24;
        }
        hours -= sleepHours.start;

        return hours * CONSTANTS.BLOCKS_PER_HOUR +
            Math.floor(now.getMinutes() / CONSTANTS.MINUTES_PER_BLOCK);
    }

    static formatHour(hour) {
        return `${(hour % 24).toString().padStart(2, '0')}:00`;
    }
}

// Block Management
class BlockManager {
    static create(hour, blockIndex, currentBlockIndex) {
        const block = document.createElement('div');
        block.className = 'block';
        const sleepHours = Settings.load();
        const normalizedHour = hour - sleepHours.start;
        const key = `planner-${hour % 24}-${blockIndex}`;
        const absoluteBlockIndex = normalizedHour * CONSTANTS.BLOCKS_PER_HOUR + blockIndex;

        this.setBlockState(block, {
            hour: hour % 24,
            sleepHours,
            absoluteBlockIndex,
            currentBlockIndex,
            key
        });

        block.addEventListener('click', () => this.handleBlockClick(block, key));
        return block;
    }

    static setBlockState(block, { hour, sleepHours, absoluteBlockIndex, currentBlockIndex, key }) {
        if (absoluteBlockIndex < currentBlockIndex) {
            block.classList.add('past');
        }
        if (hour >= sleepHours.start && hour < sleepHours.end) {
            block.classList.add('sleep');
        }
        if (absoluteBlockIndex === currentBlockIndex) {
            block.classList.add('current');
        }
        if (localStorage.getItem(key) === '1') {
            block.classList.add('active');
        }
    }

    static handleBlockClick(block, key) {
        block.classList.toggle('active');
        localStorage.setItem(key, block.classList.contains('active') ? '1' : '0');
    }
}

// Planner Management
class PlannerManager {
    static create() {
        elements.planner.innerHTML = '';
        const currentBlockIndex = TimeManager.getCurrentBlockIndex();
        const sleepHours = Settings.load();

        for (let hour = sleepHours.start; hour < 24 + sleepHours.start; hour++) {
            const hourRow = this.createHourRow(hour, currentBlockIndex);
            elements.planner.appendChild(hourRow);
        }
    }

    static createHourRow(hour, currentBlockIndex) {
        const hourRow = document.createElement('div');
        hourRow.className = 'hour-row';

        const label = document.createElement('div');
        label.className = 'hour-label';
        label.textContent = TimeManager.formatHour(hour);
        hourRow.appendChild(label);

        const blockRow = document.createElement('div');
        blockRow.className = 'block-row';

        for (let i = 0; i < CONSTANTS.BLOCKS_PER_HOUR; i++) {
            blockRow.appendChild(BlockManager.create(hour, i, currentBlockIndex));
        }

        hourRow.appendChild(blockRow);
        return hourRow;
    }
}

// Event Listeners
function initializeEventListeners() {
    elements.settingsToggle.addEventListener('click', () => {
        elements.settingsPanel.classList.toggle('open');
    });

    elements.saveSettings.addEventListener('click', () => {
        Settings.save();
        PlannerManager.create();
        elements.settingsPanel.classList.remove('open');
    });
}

// Initialize Application
function initialize() {
    Settings.load();
    PlannerManager.create();
    initializeEventListeners();
    setInterval(PlannerManager.create, CONSTANTS.UPDATE_INTERVAL);
}

initialize();