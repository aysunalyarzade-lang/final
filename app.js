const today = new Date();
let selectedDay = today.getDate(); 

const months = [
    'YANVAR', 'FEVRAL', 'MART', 'APREL', 'MAY', 'İYUN', 
    'İYUL', 'AVQUST', 'SENTYABR', 'OKTYABR', 'NOYABR', 'DEKABR'
];
let selectedMonth = months[today.getMonth()]; 

let isCalendarOpen = false;
let editIdLocation = null; 
let selectedMood = ''; 
let todoList = []; 
let diaries = []; 
let timerInterval = null;
let timerMinutes = 25;
let timerSeconds = 0;
let timerIsRunning = false;
let currentTimerMode = 'work';


const motivationInfo = document.querySelector('#motivation-info');
const calendarBtn = document.querySelector('#open-calendar-btn'); 
const todayBtn = document.querySelector('#today-btn');     
const calendarWindow = document.querySelector('#calendar-window'); 
const daysContainer = document.querySelector('#days-container');
const weeklyCards = document.querySelector('#weekly-cards');
const todoTitle = document.querySelector('#todo-title');
const inputBlock = document.querySelector('#input-block');
const activeCount = document.querySelector('#active-count');
const activeList = document.querySelector('#active-list');
const completedCount = document.querySelector('#completed-count');
const completedList = document.querySelector('#completed-list');
const diaryText = document.querySelector('#diary-text');
const saveDiaryBtn = document.querySelector('#save-diary-btn');
const lettersBox = document.querySelector('#letters-box');


async function fetchMotivation() {
    try {
        motivationInfo.innerHTML = "✨ Günün motivasiya sözü yüklənir...";
        const response = await fetch(
            "https://corsproxy.io/?https://zenquotes.io/api/random?cache=" + Date.now()
        );
        const data = await response.json();
        const quote = data[0].q;
        const author = data[0].a;

        
        motivationInfo.innerHTML = `
            ✨ <strong>Günün motivasiya sözü</strong><br>
            "${quote}"<br>
            — ${author}
        `;
    } catch (error) {
        console.error(error);
        motivationInfo.innerHTML = "❌ Motivasiya sözü yüklənmədi.";
    }
}

function initApp() {
    fetchMotivation();

    const localTasks = localStorage.getItem('todoList');
    const localDiaries = localStorage.getItem('diaries');

    if (localDiaries) {
        diaries = JSON.parse(localDiaries);
    }

    if (localTasks) {
        todoList = JSON.parse(localTasks);
    } else {
        todoList = [
            { id: 1, text: 'Alqoritmika məntiqini dərindən öyrən', completed: false, gun: selectedDay, ay: selectedMonth },
            { id: 2, text: 'Massivlərin daxili strukturlarını araşdır', completed: false, gun: selectedDay, ay: selectedMonth }
        ];
        saveToLocalStorage();
    }

    setupEventListeners();
    setupPomodoro();
    updateUI();
}

function saveToLocalStorage() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
    localStorage.setItem('diaries', JSON.stringify(diaries));
}

function getDayStatusDotHTML(gun, ay) {
    const dayTasks = todoList.filter(task => task.gun === gun && task.ay === ay);
    
    if (dayTasks.length === 0) return ''; 
    
    const completedTasks = dayTasks.filter(task => task.completed);
    
    if (completedTasks.length === dayTasks.length) {
        return '<span class="status-dot green"></span>';
    } else if (completedTasks.length > 0 && completedTasks.length < dayTasks.length) {
        return '<span class="status-dot yellow"></span>';
    } else {
        return '<span class="status-dot red"></span>';
    }
}

function updateUI() {
    todoTitle.innerText = `BUGÜNÜN İŞLƏRİ - ${selectedDay} ${selectedMonth} ${today.getFullYear()}`;
    
    const lowercaseMonthName = selectedMonth.charAt(0) + selectedMonth.slice(1).toLowerCase();
    
    const monthTitleEl = document.querySelector('.month-title');
    if (monthTitleEl) {
        monthTitleEl.innerText = `${lowercaseMonthName} ${today.getFullYear()}`;
    }

    weeklyCards.innerHTML = '';
    const azDayNames = ['B.', 'B.E', 'Ç.A', 'Ç.', 'C.A', 'C.', 'Ş.'];

    for (let i = -3; i <= 3; i++) {
        let date = new Date(today.getFullYear(), months.indexOf(selectedMonth), selectedDay); 
        date = new Date(date.setDate(date.getDate() + i));
                
        if (date.getMonth() === months.indexOf(selectedMonth)) {
            let g = date.getDate();
            let isSameDay = (g === selectedDay);
            let name = azDayNames[date.getDay()];
            
            let card = document.createElement('div');
            card.className = `day-card ${isSameDay ? 'active' : ''}`;
            
            let dotHTML = getDayStatusDotHTML(g, selectedMonth);

            card.innerHTML = `
                <span class="day-name">${name}</span>
                <span class="day-date">${g}</span>
                <div class="dot-container">${dotHTML}</div>
                ${isSameDay ? `<span class="month-label">${selectedMonth}</span>` : ''}
            `;

            card.addEventListener('click', () => {
                selectedDay = g;
                editIdLocation = null; 
                updateUI();
            });
            weeklyCards.appendChild(card);
        }
    }

    daysContainer.innerHTML = '';
    const lastDay = new Date(today.getFullYear(), months.indexOf(selectedMonth) + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) { 
        let cellContainer = document.createElement('div');
        cellContainer.className = 'day-cell-container';

        let dayCard = document.createElement('span');
        dayCard.className = 'day-num';
        dayCard.innerText = d;

        if (d === selectedDay) {
            cellContainer.className += ' active-day';
        } else {
            cellContainer.className += ' clickable-day';
            cellContainer.addEventListener('click', () => {
                selectedDay = d;
                isCalendarOpen = false;
                calendarWindow.style.display = 'none';
                editIdLocation = null;
                updateUI();
            });
        }

        let dotHTML = getDayStatusDotHTML(d, selectedMonth);
        let dotDiv = document.createElement('div');
        dotDiv.className = 'dot-container';
        dotDiv.innerHTML = dotHTML;

        cellContainer.appendChild(dayCard);
        cellContainer.appendChild(dotDiv);
        daysContainer.appendChild(cellContainer);
    }

    activeList.innerHTML = '';
    completedList.innerHTML = '';
    
    const activeTasks = todoList.filter(item => item.gun === selectedDay && item.ay === selectedMonth && !item.completed);
    activeTasks.map(item => {
        let div = document.createElement('div');
        div.className = 'todo-item';
        div.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="chk-click" data-id="${item.id}" />
                <span>${item.text}</span>
            </div>
            <div class="todo-actions">
                <button type="button" class="btn-edit" data-id="${item.id}">✏️</button>
                <button type="button" class="btn-del" data-id="${item.id}">🗑️</button>
            </div>
        `;
        activeList.appendChild(div);
        return item;
    });

    const completedTasks = todoList.filter(item => item.gun === selectedDay && item.ay === selectedMonth && item.completed);
    completedTasks.map(item => {
        let div = document.createElement('div');
        div.className = 'todo-item completed';
        div.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" checked class="chk-click green-checkbox" data-id="${item.id}" />
                <span><s>${item.text}</s></span>
            </div>
            <div class="todo-actions">
                <button type="button" class="btn-del" data-id="${item.id}">🗑️</button>
            </div>
        `;
        completedList.appendChild(div);
        return item;
    });

    activeCount.innerText = `Aktiv Tapşırıqlar (${activeTasks.length})`;
    completedCount.innerText = `Tamamlananlar (${completedTasks.length})`;

    if (editIdLocation !== null) {
        const editingItem = todoList.find(i => i.id === editIdLocation);
        inputBlock.innerHTML = `
            <div class="edit-container">
                <input type="text" id="edit-input-field" class="todo-input" value="${editingItem.text}" />
                <button type="button" id="save-edit-btn" class="save-edit-btn">Yadda</button>
            </div>
        `;
        document.querySelector('#save-edit-btn').addEventListener('click', saveEdit);
    } else {
        inputBlock.innerHTML = `
            <input type="text" id="todo-input" class="todo-input" placeholder="+ Yeni tapşırıq əlavə et..." />
        `;
    }

    Array.from(document.querySelectorAll('.chk-click')).map(box => {
        box.addEventListener('change', (e) => toggleTaskStatus(Number(e.target.dataset.id)));
        return box;
    });
    Array.from(document.querySelectorAll('.btn-edit')).map(b => {
        b.addEventListener('click', (e) => startEdit(Number(e.target.dataset.id)));
        return b;
    });
    Array.from(document.querySelectorAll('.btn-del')).map(b => {
        b.addEventListener('click', (e) => deleteTask(Number(e.target.dataset.id)));
        return b;
    });

    const currentDayDiary = diaries.find(x => x.gun === selectedDay && x.ay === selectedMonth);
    diaryText.value = currentDayDiary ? currentDayDiary.text : '';
    selectedMood = currentDayDiary && currentDayDiary.mood ? currentDayDiary.mood : '';

    Array.from(document.querySelectorAll('.mood-btn')).map(btn => {
        if(btn.dataset.mood === selectedMood) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
        return btn;
    });

    lettersBox.innerHTML = '';
    diaries
        .filter(x => (x.text && x.text.trim() !== '') || x.mood)
        .map(x => {
            let mDiv = document.createElement('div');
            mDiv.className = 'letter-box';
            let emoji = x.mood ? x.mood : '✉️';
            
            let shortText = 'Yalnız əhval qeyd edilib.';
            if (x.text) {
                shortText = x.text.length > 40 ? x.text.substring(0, 40) + '...' : x.text;
            }
            
            mDiv.innerHTML = `
                <div class="letter-left">
                    <div class="letter-icon">${emoji}</div>
                    <div class="letter-info">
                        <span class="letter-date">${x.gun} ${x.ay}</span>
                        <span class="letter-preview">${shortText}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="letter-seal">Möhürlənib</span>
                    <button type="button" class="btn-letter-del" data-gun="${x.gun}" data-ay="${x.ay}">🗑️</button>
                </div>
            `;
            
            mDiv.addEventListener('click', (e) => {
                if(e.target.classList.contains('btn-letter-del') || e.target.closest('.btn-letter-del')) return;
                selectedDay = x.gun;
                selectedMonth = x.ay;
                updateUI();
                diaryText.focus();
            });
            lettersBox.appendChild(mDiv);
            return x;
        });

    Array.from(document.querySelectorAll('.btn-letter-del')).map(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteLetter(Number(btn.dataset.gun), btn.dataset.ay);
        });
        return btn;
    });
}

function deleteLetter(gun, ay) {
    diaries = diaries.filter(x => !(x.gun === gun && x.ay === ay));
    saveToLocalStorage();
    updateUI();
}

function addNewTodo(e) {
    let newTodo = {
        id: Date.now(), 
        text: e.target.value.trim(),
        completed: false,
        gun: selectedDay,
        ay: selectedMonth
    };
    todoList.push(newTodo);
    saveToLocalStorage();
    updateUI();
}

function toggleTaskStatus(id) {
    todoList = todoList.map(item => {
        if (item.id === id) {
            return { ...item, completed: !item.completed };
        }
        return item;
    });
    saveToLocalStorage();
    updateUI(); 
}

function deleteTask(id) {
    todoList = todoList.filter(item => item.id !== id);
    if (editIdLocation === id) editIdLocation = null;
    saveToLocalStorage();
    updateUI();
}

function startEdit(id) {
    editIdLocation = id;
    updateUI();
}

function saveEdit() {
    let textVal = document.querySelector('#edit-input-field').value.trim();
    if (textVal !== '') {
        todoList = todoList.map(item => {
            if (item.id === editIdLocation) {
                return { ...item, text: textVal };
            }
            return item;
        });
        editIdLocation = null;
        saveToLocalStorage();
        updateUI();
    }
}

function saveDiary() {
    let index = diaries.findIndex(x => x.gun === selectedDay && x.ay === selectedMonth);
    let content = diaryText.value.trim();

    if (index > -1) {
        diaries[index].text = content;
        diaries[index].mood = selectedMood;
    } else {
        diaries.push({ gun: selectedDay, ay: selectedMonth, text: content, mood: selectedMood });
    }
    saveToLocalStorage();

    const originalText = saveDiaryBtn.innerText;
    saveDiaryBtn.innerText = "Məktublandı! ✉️";
    saveDiaryBtn.style.background = "#3498db";

    setTimeout(() => {
        saveDiaryBtn.innerText = originalText;
        saveDiaryBtn.style.background = "#2ecc71";
        updateUI(); 
    }, 1000);
}

function setupPomodoro() {
    const widget = document.querySelector('#pomodoro');
    const toggleBtn = document.querySelector('#pomo-toggle-btn');
    const display = document.querySelector('#timer-display');
    const startBtn = document.querySelector('#timer-start-btn');
    const resetBtn = document.querySelector('#timer-reset-btn');
    const workModeBtn = document.querySelector('#mode-work');
    const breakModeBtn = document.querySelector('#mode-break');
    const statusTxt = document.querySelector('#pomo-status');

    if (toggleBtn && widget) {
        toggleBtn.addEventListener('click', () => {
            widget.classList.toggle('collapsed');
        });
    }

    function updateDisplay() {
        if (!display) return;
        let m = timerMinutes < 10 ? '0' + timerMinutes : timerMinutes;
        let s = timerSeconds < 10 ? '0' + timerSeconds : timerSeconds;
        display.innerText = `${m}:${s}`;
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (timerIsRunning) {
                clearInterval(timerInterval);
                startBtn.innerText = 'Davam Et';
                timerIsRunning = false;
            } else {
                timerIsRunning = true;
                startBtn.innerText = 'Dondur';

                timerInterval = setInterval(() => {
                    if (timerSeconds === 0) {
                        if (timerMinutes === 0) {
                            clearInterval(timerInterval);
                            alert(currentTimerMode === 'work' ? '📚 Fokus vaxtı bitdi! Fasilə ver.' : '⚡ Fasilə bitdi! Fokusa qayıt.');
                            timerIsRunning = false;
                            startBtn.innerText = 'Başla';
                            resetTimer();
                            return;
                        }
                        timerMinutes--;
                        timerSeconds = 59;
                    } else {
                        timerSeconds--;
                    }
                    updateDisplay();
                }, 1000);
            }
        });
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerIsRunning = false;
        if (startBtn) startBtn.innerText = 'Başla';
        timerMinutes = currentTimerMode === 'work' ? 25 : 5;
        timerSeconds = 0;
        updateDisplay();
    }

    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    if (workModeBtn && breakModeBtn && statusTxt) {
        workModeBtn.addEventListener('click', () => {
            currentTimerMode = 'work';
            workModeBtn.classList.add('active');
            breakModeBtn.classList.remove('active');
            statusTxt.innerText = '🎯 Fokus Zamanı';
            resetTimer();
        });

        breakModeBtn.addEventListener('click', () => {
            currentTimerMode = 'break';
            breakModeBtn.classList.add('active');
            workModeBtn.classList.remove('active');
            statusTxt.innerText = '☕ Fasilə Zamanı';
            resetTimer();
        });
    }
}

function scatterStars(e) {
    let x = e.clientX;
    let y = e.clientY;

    for (let i = 0; i < 5; i++) {
        let p = document.createElement('span');
        p.className = 'sparkle-particle';
        p.innerText = '✨';
        p.style.top = y + 'px';
        p.style.left = x + 'px';

        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 3 + 2;
        let mx = Math.cos(angle) * speed * 25;
        let my = Math.sin(angle) * speed * 25;

        p.style.setProperty('--x', mx + 'px');
        p.style.setProperty('--y', my + 'px');

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
    }
}

function setupEventListeners() {
    const todoForm = document.querySelector('#todo-form');
    if (todoForm) {
        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inp = document.querySelector('#todo-input');
            if (inp && inp.value.trim() !== '') {
                addNewTodo({ target: inp });
                inp.value = '';
            }
        });
    }

    if (calendarBtn && calendarWindow) {
        calendarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isCalendarOpen = !isCalendarOpen;
            calendarWindow.style.display = isCalendarOpen ? 'block' : 'none';
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            const freshToday = new Date();
            selectedDay = freshToday.getDate(); 
            selectedMonth = months[freshToday.getMonth()];
            editIdLocation = null;
            isCalendarOpen = false;
            if (calendarWindow) calendarWindow.style.display = 'none';
            updateUI();
        });
    }

    document.addEventListener('mousedown', (e) => {
        let wrapper = document.querySelector('.calendar-wrapper-fixed');
        if (isCalendarOpen && wrapper && !wrapper.contains(e.target)) {
            isCalendarOpen = false;
            if (calendarWindow) calendarWindow.style.display = 'none';
        }
    });

    if (saveDiaryBtn) {
        saveDiaryBtn.addEventListener('click', saveDiary);
    }

    Array.from(document.querySelectorAll('.mood-btn')).map(btn => {
        btn.addEventListener('click', () => {
            if(btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                selectedMood = '';
            } else {
                Array.from(document.querySelectorAll('.mood-btn')).map(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedMood = btn.dataset.mood;
            }
        });
        return btn;
    });

    for(let i = 1; i <= 12; i++) {
        let el = document.querySelector(`#star${i}`);
        if(el) el.addEventListener('click', scatterStars);
    }
}

window.onload = initApp;