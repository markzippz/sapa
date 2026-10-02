/* DOM ELEMENTS */
const prelimInput = document.getElementById('prelim');
const midtermInput = document.getElementById('midterm');
const preFinalsInput = document.getElementById('preFinals');
const finalsInput = document.getElementById('finals');

const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const themeToggle = document.getElementById('themeToggle');
const computeGWABtn = document.getElementById('computeGWABtn');

const resultsSection = document.getElementById('resultsSection');
const savedSection = document.getElementById('savedSection');
const computeResultSection = document.getElementById('computeResultSection');
const recordsList = document.getElementById('recordsList');

const averageDisplay = document.getElementById('averageDisplay');
const gwaDisplay = document.getElementById('gwaDisplay');
const remarkChip = document.getElementById('remarkChip');

const inputError = document.getElementById('inputError');

const subjectModal = document.getElementById('subjectModal');
const subjectInput = document.getElementById('subjectInput');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');
const modalError = document.getElementById('modalError');

const deleteModal = document.getElementById('deleteModal');
const deleteConfirm = document.getElementById('deleteConfirm');
const deleteCancel = document.getElementById('deleteCancel');

/* GRADE TO GWA CONVERSION TABLE */
const gradeToGWA = [
    { min: 97.50, max: 100, gwa: 1.00, remark: 'Excellent', class: 'excellent' },
    { min: 94.50, max: 97.49, gwa: 1.25, remark: 'Very Good', class: 'very-good' },
    { min: 91.50, max: 94.49, gwa: 1.50, remark: 'Very Good', class: 'very-good' },
    { min: 86.50, max: 91.49, gwa: 1.75, remark: 'Very Good', class: 'very-good' },
    { min: 81.50, max: 86.49, gwa: 2.00, remark: 'Satisfactory', class: 'satisfactory' },
    { min: 76.00, max: 81.49, gwa: 2.25, remark: 'Satisfactory', class: 'satisfactory' },
    { min: 70.50, max: 75.99, gwa: 2.50, remark: 'Satisfactory', class: 'satisfactory' },
    { min: 65.00, max: 70.49, gwa: 2.75, remark: 'Fair', class: 'fair' },
    { min: 59.50, max: 64.99, gwa: 3.00, remark: 'Fair', class: 'fair' },
    { min: 0.00, max: 59.49, gwa: 5.00, remark: 'Failed', class: 'failed' }
];

let currentData = {
    prelim: 0,
    midterm: 0,
    preFinals: 0,
    finals: 0,
    average: 0,
    gwa: '5.00',
    remark: 'No Grade',
    class: 'neutral'
};

let deleteRecordId = null;

/* ---------- THEME MANAGEMENT ---------- */

function initTheme() {
    const savedTheme = localStorage.getItem('gwaTheme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    updateThemeIcon();
    localStorage.setItem('gwaTheme', isDark ? 'dark' : 'light');
});

/* ---------- VALIDATION + NORMALIZATION ---------- */

function normalizeGrade(value) {
    if (isNaN(value)) return 0;
    if (value > 100) return 100;
    if (value < 0) return 0;
    return value;
}

function validateInputs() {
    const fields = [
        { input: prelimInput, name: 'Prelim' },
        { input: midtermInput, name: 'Midterm' },
        { input: preFinalsInput, name: 'Pre-Finals' },
        { input: finalsInput, name: 'Finals' }
    ];

    fields.forEach(f => f.input.classList.remove('input-error'));

    for (const field of fields) {
        if (field.input.value.trim() === '') {
            inputError.textContent = `Please enter your ${field.name} grade before calculating.`;
            field.input.classList.add('input-error');
            field.input.focus();
            return false;
        }
    }

    inputError.textContent = '';
    return true;
}

/* ---------- GWA CALCULATION ---------- */

function getGradeInfo(average) {
    const gradeInfo = gradeToGWA.find(g => average >= g.min && average <= g.max);
    return gradeInfo || {
        gwa: 5.00,
        remark: 'No Grade',
        class: 'neutral'
    };
}

function calculateGWA() {
    if (!validateInputs()) return;

    let prelim = normalizeGrade(parseFloat(prelimInput.value));
    let midterm = normalizeGrade(parseFloat(midtermInput.value));
    let preFinals = normalizeGrade(parseFloat(preFinalsInput.value));
    let finals = normalizeGrade(parseFloat(finalsInput.value));

    prelimInput.value = prelim.toFixed(2);
    midtermInput.value = midterm.toFixed(2);
    preFinalsInput.value = preFinals.toFixed(2);
    finalsInput.value = finals.toFixed(2);

    const averageRaw = prelim * 0.20 + midterm * 0.20 + preFinals * 0.20 + finals * 0.40;
    const average = Math.min(averageRaw, 100);

    currentData = {
        prelim,
        midterm,
        preFinals,
        finals,
        average: parseFloat(average.toFixed(2))
    };

    const gradeInfo = getGradeInfo(currentData.average);
    currentData.gwa = gradeInfo.gwa.toFixed(2);
    currentData.remark = gradeInfo.remark;
    currentData.class = gradeInfo.class;

    displayResults();
    resultsSection.style.display = 'block';
}

function displayResults() {
    averageDisplay.textContent = currentData.average.toFixed(2);
    gwaDisplay.textContent = currentData.gwa;
    if (remarkChip) {
        remarkChip.textContent = currentData.remark;
        remarkChip.className = `result-chip ${currentData.class}`;
    }
}

/* ---------- INPUT EVENTS ---------- */

[prelimInput, midtermInput, preFinalsInput, finalsInput].forEach(input => {
    input.addEventListener('input', () => {
        inputError.textContent = '';
        input.classList.remove('input-error');
    });

    input.addEventListener('change', () => {
        if (input.value !== '') {
            const value = normalizeGrade(parseFloat(input.value));
            input.value = value.toFixed(2);
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateGWA();
        }
    });
});

/* ---------- BUTTON EVENTS ---------- */

calculateBtn.addEventListener('click', calculateGWA);

clearBtn.addEventListener('click', () => {
    prelimInput.value = '';
    midtermInput.value = '';
    preFinalsInput.value = '';
    finalsInput.value = '';
    inputError.textContent = '';
    [prelimInput, midtermInput, preFinalsInput, finalsInput].forEach(i => 
        i.classList.remove('input-error')
    );
    resultsSection.style.display = 'none';
    currentData = {
        prelim: 0,
        midterm: 0,
        preFinals: 0,
        finals: 0,
        average: 0,
        gwa: '5.00',
        remark: 'No Grade',
        class: 'neutral'
    };
    prelimInput.focus();
});

saveBtn.addEventListener('click', () => {
    if (resultsSection.style.display === 'none' || currentData.average === 0) {
        return;
    }
    subjectInput.value = '';
    modalError.textContent = '';
    subjectModal.style.display = 'flex';
    subjectInput.focus();
});

/* ---------- SAVE MODAL EVENTS ---------- */

modalSave.addEventListener('click', () => {
    const subjectName = subjectInput.value.trim();
    
    if (!subjectName) {
        modalError.textContent = 'Please enter a subject name';
        return;
    }

    saveRecord(subjectName);
    subjectModal.style.display = 'none';
});

modalCancel.addEventListener('click', () => {
    subjectModal.style.display = 'none';
});

subjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        modalSave.click();
    }
});

subjectInput.addEventListener('input', () => {
    modalError.textContent = '';
});

subjectModal.addEventListener('click', (e) => {
    if (e.target === subjectModal) {
        subjectModal.style.display = 'none';
    }
});

/* ---------- SAVED RECORDS MANAGEMENT ---------- */

function saveRecord(subjectName) {
    const record = {
        id: Date.now(),
        subject: subjectName,
        prelim: currentData.prelim,
        midterm: currentData.midterm,
        preFinals: currentData.preFinals,
        finals: currentData.finals,
        average: currentData.average,
        gwa: currentData.gwa,
        remark: currentData.remark,
        class: currentData.class
    };

    let records = JSON.parse(localStorage.getItem('gwaRecords')) || [];
    records.push(record);
    localStorage.setItem('gwaRecords', JSON.stringify(records));

    displayRecords();
    savedSection.style.display = 'block';
}

function displayRecords() {
    const records = JSON.parse(localStorage.getItem('gwaRecords')) || [];
    recordsList.innerHTML = '';

    if (records.length === 0) {
        recordsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No saved records yet</p>';
        return;
    }

    records.forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        recordCard.innerHTML = `
            <div class="record-header">
                <div class="record-subject">${escapeHTML(record.subject)}</div>
                <button class="record-delete" data-id="${record.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="record-grades">
                <div class="record-grade-row">
                    <div class="record-grade-item">
                        <span class="grade-label">Prelim</span>
                        <span class="grade-value">${record.prelim}</span>
                    </div>
                    <div class="record-grade-item">
                        <span class="grade-label">Midterm</span>
                        <span class="grade-value">${record.midterm}</span>
                    </div>
                </div>
                <div class="record-grade-row">
                    <div class="record-grade-item">
                        <span class="grade-label">Pre-Finals</span>
                        <span class="grade-value">${record.preFinals}</span>
                    </div>
                    <div class="record-grade-item">
                        <span class="grade-label">Finals</span>
                        <span class="grade-value">${record.finals}</span>
                    </div>
                </div>
            </div>
            <div class="record-results">
                <div class="record-result-item ${record.class}">
                    <span class="result-label">Average</span>
                    <span class="result-value">${record.average.toFixed(2)}</span>
                </div>
                <div class="record-result-item ${record.class}">
                    <span class="result-label">GWA</span>
                    <span class="result-value">${record.gwa}</span>
                </div>
                <div class="record-result-item ${record.class}">
                    <span class="result-label">Remark</span>
                    <span class="result-value">${record.remark}</span>
                </div>
            </div>
        `;

        recordsList.appendChild(recordCard);
    });

    document.querySelectorAll('.record-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecordId = parseInt(btn.dataset.id, 10);
            deleteModal.style.display = 'flex';
        });
    });
}

/* ---------- DELETE MODAL EVENTS ---------- */

deleteConfirm.addEventListener('click', () => {
    if (deleteRecordId) {
        let records = JSON.parse(localStorage.getItem('gwaRecords')) || [];
        records = records.filter(r => r.id !== deleteRecordId);
        localStorage.setItem('gwaRecords', JSON.stringify(records));
        
        displayRecords();
        
        if (records.length === 0) {
            savedSection.style.display = 'none';
            computeResultSection.style.display = 'none';
        }
    }
    deleteModal.style.display = 'none';
    deleteRecordId = null;
});

deleteCancel.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    deleteRecordId = null;
});

deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteModal.style.display = 'none';
        deleteRecordId = null;
    }
});

/* ---------- COMPUTE OVERALL GWA ---------- */

function computeOverallGWA() {
    const records = JSON.parse(localStorage.getItem('gwaRecords')) || [];
    
    if (records.length === 0) {
        alert('No saved records to compute GWA');
        return;
    }

    // Simple average: sum all GWAs and divide by count
    const totalGWA = records.reduce((sum, record) => sum + parseFloat(record.gwa), 0);
    const overallGWA = (totalGWA / records.length).toFixed(2);

    // Display results
    document.getElementById('totalUnitsDisplay').textContent = records.length;
    document.getElementById('overallGWADisplay').textContent = overallGWA;
    document.getElementById('subjectCountDisplay').textContent = records.length;

    // Display subject breakdown
    const breakdownContainer = document.getElementById('subjectBreakdown');
    breakdownContainer.innerHTML = '<h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-primary);">Subject Breakdown</h3>';
    
    records.forEach(record => {
        const subjectItem = document.createElement('div');
        subjectItem.className = 'subject-item';
        subjectItem.innerHTML = `
            <span class="subject-name">${escapeHTML(record.subject)}</span>
            <span class="subject-grade">${record.gwa}</span>
        `;
        breakdownContainer.appendChild(subjectItem);
    });

    computeResultSection.style.display = 'block';
}

computeGWABtn.addEventListener('click', computeOverallGWA);

/* ---------- HELPER FUNCTIONS ---------- */

function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* ---------- INITIALIZATION ---------- */

initTheme();
displayRecords();
if (recordsList.children.length > 0 && recordsList.innerHTML.indexOf('No saved records') === -1) {
    savedSection.style.display = 'block';
}