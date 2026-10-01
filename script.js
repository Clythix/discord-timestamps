const dateInput = document.getElementById('d');
const timeInput = document.getElementById('hm');
const typeSelect = document.getElementById('t');
const codeOutput = document.getElementById('code');
const previewOutput = document.getElementById('preview');
const copyBtn = document.getElementById('copy');
const currentBtn = document.getElementById('current');
const yearSpan = document.getElementById('currentYear');

yearSpan.textContent = new Date().getFullYear();

function setLocalDateTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    dateInput.value = `${year}-${month}-${day}`;
    timeInput.value = `${hours}:${minutes}`;
}

function getRelativeTimeString(unixTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = unixTimestamp - now;
    const absDiff = Math.abs(diff);

    if (absDiff < 60) {
        return diff >= 0 ? 'in a few seconds' : 'a few seconds ago';
    } else if (absDiff < 3600) {
        const mins = Math.round(absDiff / 60);
        return diff >= 0 ? `in ${mins} minute(s)` : `${mins} minute(s) ago`;
    } else if (absDiff < 86400) {
        const hours = Math.round(absDiff / 3600);
        return diff >= 0 ? `in ${hours} hour(s)` : `${hours} hour(s) ago`;
    } else {
        const days = Math.round(absDiff / 86400);
        return diff >= 0 ? `in ${days} day(s)` : `${days} day(s) ago`;
    }
}

function updateTimestamp() {
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;

    if (!dateVal || !timeVal) return;

    const selectedDate = new Date(`${dateVal}T${timeVal}:00`);
    if (isNaN(selectedDate.getTime())) return;

    const unixTimestamp = Math.floor(selectedDate.getTime() / 1000);
    const formatType = typeSelect.value;

    codeOutput.value = `<t:${unixTimestamp}:${formatType}>`;

    if (formatType === 'R') {
        previewOutput.textContent = getRelativeTimeString(unixTimestamp);
    } else {
        previewOutput.textContent = selectedDate.toLocaleString();
    }
}

/* Safe picker trigger with cross-origin iframe protection */
dateInput.addEventListener('click', () => {
    try {
        if (typeof dateInput.showPicker === 'function') {
            dateInput.showPicker();
        }
    } catch (e) {
        // Fallback gracefully if blocked by iframe security
    }
});

timeInput.addEventListener('click', () => {
    try {
        if (typeof timeInput.showPicker === 'function') {
            timeInput.showPicker();
        }
    } catch (e) {
        // Fallback gracefully if blocked by iframe security
    }
});

dateInput.addEventListener('input', updateTimestamp);
timeInput.addEventListener('input', updateTimestamp);
typeSelect.addEventListener('change', updateTimestamp);

currentBtn.addEventListener('click', () => {
    setLocalDateTime();
    updateTimestamp();
});

copyBtn.addEventListener('click', () => {
    codeOutput.select();
    navigator.clipboard.writeText(codeOutput.value);
    copyBtn.textContent = 'COPIED!';
    setTimeout(() => {
        copyBtn.textContent = 'COPY';
    }, 2000);
});

setLocalDateTime();
updateTimestamp();