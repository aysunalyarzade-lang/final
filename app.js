let secilenGun = 4; 
let secilenAy = 'İYUN';
let teqvimAciqdir = false;
let edidIdYeri = null; 
let secilenMood = ''; 
let isler_siyahisi = []; 
let xatireler = []; 
let timerInterval = null;
let timerMinutes = 25;
let timerSeconds = 0;
let timerIsRunning = false;
let currentTimerMode = 'work';

const motivasiyaSozleri = [
    "✨ Alqoritm: Problemi addım-addım həll etmək sənətidir!",
    "🚀 Hər böyük proqram xırda bir 'for' dövrü ilə başlayır!",
    "🔥 Bugünü düzgün planlamaq effektiv refaktorinqdir!",
    "🧠 Beynini təmiz saxla, kodunu optimize et!",
    "🎯 Konsentrasiya olanda 'Big O' asılılığı sıfıra enir!"
];

const sozYeri = document.getElementById('soz-yeri');
const teqvimBtn = document.getElementById('teqvim-ac-btn');
const buGunBtn = document.getElementById('bu-gun-btn'); 
const teqvimPenceresei = document.getElementById('teqvim-pencerəsi');
const gunlerinYeri = document.getElementById('gunlerin-yeri');
const heftelikKartlar = document.getElementById('heftelik-kartlar');
const todoBasliq = document.getElementById('todo-basliq');
const inputBlok = document.getElementById('input-blok');
const aktivSay = document.getElementById('aktiv-say');
const aktivSiyahisi = document.getElementById('aktiv-siyahisi');
const bitenSay = document.getElementById('biten-say');
const bitenSiyahisi = document.getElementById('biten-siyahisi');
const xatireMetni = document.getElementById('xatire-metni');
const xatireYaddaSaxlaBtn = document.getElementById('xatire-yadda-saxla');
const mektublarQutusu = document.getElementById('mektublar-qutusu');

function baslat() {
    let randomIndeks = Math.floor(Math.random() * motivasiyaSozleri.length);
    sozYeri.innerText = motivasiyaSozleri[randomIndeks];

    const lokalIsler = localStorage.getItem('isler_siyahisi');
    const lokalXatireler = localStorage.getItem('xatireler');

    if (lokalXatireler) {
        xatireler = JSON.parse(lokalXatireler);
    }

    if (lokalIsler) {
        isler_siyahisi = JSON.parse(lokalIsler);
    } else {
        isler_siyahisi = [
            { id: 1, text: 'Alqoritmika məntiqini dərindən öyrən', completed: false, gun: 4, ay: 'İYUN' },
            { id: 2, text: 'Massivlərin daxili strukturlarını araşdır', completed: false, gun: 4, ay: 'İYUN' }
        ];
        yaddaSAXLA_Lokal();
    }


    hadiseleriQur();
    pomodoroQur();
    ekraniYenile();
}


function yaddaSAXLA_Lokal() {
    localStorage.setItem('isler_siyahisi', JSON.stringify(isler_siyahisi));
    localStorage.setItem('xatireler', JSON.stringify(xatireler));
}

function getDayStatusDotHTML(gun, ay) {
    let gununIsSayi = 0;
    let tamamlanmayanlarSayi = 0;

    for (let i = 0; i < isler_siyahisi.length; i++) {
        let tapşırıq = isler_siyahisi[i];
        if (tapşırıq.gun === gun && tapşırıq.ay === ay) {
            gununIsSayi++;
            if (tapşırıq.completed === false) {
                tamamlanmayanlarSayi++;
            }
        }
    }

    if (gununIsSayi === 0) {
        return '';
    }
    
    if (tamamlanmayanlarSayi > 0) {
        return '<span class="status-dot yellow"></span>'; 
    } else {
        return '<span class="status-dot green"></span>'; 
    }
}

function ekraniYenile() {
    todoBasliq.innerText = `BUGÜNÜN İŞLƏRİ - ${secilenGun} ${secilenAy} 2026`;
    heftelikKartlar.innerHTML = '';
    const azGununAdlari = ['B.', 'B.E', 'Ç.A', 'Ç.', 'C.A', 'C.', 'Ş.'];
 
    

    for (let i = -3; i <= 3; i++) {
        let tarix = new Date(2026, 5, secilenGun); 
        tarix.setDate(tarix.getDate() + i);
                
                if (tarix.getMonth() === 5) {
                    let g = tarix.getDate();
                    let eyniGundurmu = (g === secilenGun);
                    let ad = azGununAdlari[tarix.getDay()];
                    
                    let kart = document.createElement('div');
                    kart.className = `day-card ${eyniGundurmu ? 'active' : ''}`;
                    
                    let dotHTML = getDayStatusDotHTML(g, secilenAy);
        
                    kart.innerHTML = `
                        <span class="day-name">${ad}</span>
                        <span class="day-date">${g}</span>
                        <div class="dot-container">${dotHTML}</div>
                        ${eyniGundurmu ? '<span class="month-label">İYUN</span>' : ''}
                    `;
            

            kart.addEventListener('click', () => {
                secilenGun = g;
                edidIdYeri = null; 
                ekraniYenile();
            });
            heftelikKartlar.appendChild(kart);
        }
    }

    gunlerinYeri.innerHTML = '';
    for (let d = 1; d <= 30; d++) { 
        let cellContainer = document.createElement('div');
        cellContainer.className = 'day-cell-container';

        let gunKart = document.createElement('span');
        gunKart.className = 'day-num';
        gunKart.innerText = d;

        if (d === secilenGun) {
            cellContainer.className += ' active-day';
        } else {
            cellContainer.className += ' clickable-day';
            cellContainer.addEventListener('click', () => {
                secilenGun = d;
                teqvimAciqdir = false;
                teqvimPenceresei.style.display = 'none';
                edidIdYeri = null;
                ekraniYenile();
            });
        }

        
        let dotHTML = getDayStatusDotHTML(d, secilenAy);
        let dotDiv = document.createElement('div');
        dotDiv.className = 'dot-container';
        dotDiv.innerHTML = dotHTML;

        cellContainer.appendChild(gunKart);
        cellContainer.appendChild(dotDiv);
        gunlerinYeri.appendChild(cellContainer);
    }


    aktivSiyahisi.innerHTML = '';
    bitenSiyahisi.innerHTML = '';
    
    let aktivlerSaygaci = 0;
    let bitenlerSaygaci = 0;


    for (let i = 0; i < isler_siyahisi.length; i++) {
        let item = isler_siyahisi[i];
        
        if (item.gun === secilenGun && item.ay === secilenAy) {
            if (item.completed === false) {
                aktivlerSaygaci++;
                let div = document.createElement('div');
                div.className = 'todo-item';
                div.innerHTML = `
                    <div class="todo-left">
                        <input type="checkbox" class="chk-click" data-id="${item.id}" />
                        <span>${item.text}</span>
                    </div>
                    <div class="todo-actions">
                        <button class="btn-edit" data-id="${item.id}">✏️</button>
                        <button class="btn-del" data-id="${item.id}">🗑️</button>
                    </div>
                `;

                
                aktivSiyahisi.appendChild(div);
            } else {
                bitenlerSaygaci++;
                let div = document.createElement('div');
                div.className = 'todo-item completed';
                div.innerHTML = `
                    <div class="todo-left">
                        <input type="checkbox" checked class="chk-click green-checkbox" data-id="${item.id}" />
                        <span><s>${item.text}</s></span>
                    </div>
                    <div class="todo-actions">
                        <button class="btn-del" data-id="${item.id}">🗑️</button>
                    </div>
                `;
                bitenSiyahisi.appendChild(div);
            }
        }
    }

    aktivSay.innerText = `Aktiv Tapşırıqlar (${aktivlerSaygaci})`;
    bitenSay.innerText = `Tamamlananlar (${bitenlerSaygaci})`;

    if (edidIdYeri !== null) {
        let redakteOlanObraz = null;
        for (let i = 0; i < isler_siyahisi.length; i++) {
            if (isler_siyahisi[i].id === edidIdYeri) {
                redakteOlanObraz = isler_siyahisi[i];
                break;
            }
        }
        inputBlok.innerHTML = `
            <div class="edit-container">
                <input type="text" id="edit-input-yeri" class="todo-input" value="${redakteOlanObraz.text}" />
                <button id="kod-yadda-saxla-btn" class="save-edit-btn">Yadda</button>
            </div>
        `;
        document.getElementById('kod-yadda-saxla-btn').addEventListener('click', redakteYaddaSaxla);
    } else {
        inputBlok.innerHTML = `
            <input type="text" id="todo-input" class="todo-input" placeholder="+ Yeni tapşırıq əlavə et..." />
        `;
        document.getElementById('todo-input').addEventListener('keydown', yeniTodoElaveEt);
    }


    document.querySelectorAll('.chk-click').forEach(box => {
        box.addEventListener('change', (e) => statusDeyis(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('.btn-edit').forEach(b => {
        b.addEventListener('click', (e) => redakteBasla(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('.btn-del').forEach(b => {
        b.addEventListener('click', (e) => elemaniSil(Number(e.target.dataset.id)));
    });


    let oGununQeydi = null;
    for (let i = 0; i < xatireler.length; i++) {
        if (xatireler[i].gun === secilenGun && xatireler[i].ay === secilenAy) {
            oGununQeydi = xatireler[i];
            break;
        }
    }

    xatireMetni.value = oGununQeydi ? oGununQeydi.text : '';
    secilenMood = oGununQeydi && oGununQeydi.mood ? oGununQeydi.mood : '';
    

    document.querySelectorAll('.mood-btn').forEach(btn => {
        if(btn.dataset.mood === secilenMood) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    mektublarQutusu.innerHTML = '';
    for (let i = 0; i < xatireler.length; i++) {
        let x = xatireler[i];
        if ((x.text && x.text.trim() !== '') || x.mood) {
            let mDiv = document.createElement('div');
            mDiv.className = 'letter-box';
            let emoji = x.mood ? x.mood : '✉️';
            
            let qisaMetn = 'Yalnız əhval qeyd edilib.';
            if (x.text) {
                if (x.text.length > 40) {
                    qisaMetn = x.text.substring(0, 40) + '...';
                } else {
                    qisaMetn = x.text;
                }
            }
            
            mDiv.innerHTML = `
                <div class="letter-left">
                    <div class="letter-icon">${emoji}</div>
                    <div class="letter-info">
                        <span class="letter-date">${x.gun} ${x.ay}</span>
                        <span class="letter-preview">${qisaMetn}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="letter-seal">Möhürlənib</span>
                    <button class="btn-letter-del" data-gun="${x.gun}" data-ay="${x.ay}">🗑️</button>
                </div>
            `;
            
            mDiv.addEventListener('click', (e) => {
                if(e.target.classList.contains('btn-letter-del') || e.target.closest('.btn-letter-del')) return;
                secilenGun = x.gun;
                secilenAy = x.ay;
                ekraniYenile();
                xatireMetni.focus();
            });
            mektublarQutusu.appendChild(mDiv);
        }
    }

    document.querySelectorAll('.btn-letter-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            mektubSil(Number(btn.dataset.gun), btn.dataset.ay);
        });
    });
}

        function mektubSil(gun, ay) {
            let yeniXatireler = [];
            for (let i = 0; i < xatireler.length; i++) {
                if (!(xatireler[i].gun === gun && xatireler[i].ay === ay)) {
                    yeniXatireler.push(xatireler[i]);
                }
            }
            xatireler = yeniXatireler;
            yaddaSAXLA_Lokal();
            ekraniYenile();
}

function yeniTodoElaveEt(e) {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        let yeniIs = {
            id: Date.now(), 
            text: e.target.value.trim(),
            completed: false,
            gun: secilenGun,
            ay: secilenAy
        };
        isler_siyahisi.push(yeniIs);
        yaddaSAXLA_Lokal();
        ekraniYenile();
    }
}

        function statusDeyis(id) {
            for (let i = 0; i < isler_siyahisi.length; i++) {
                if (isler_siyahisi[i].id === id) {
                    isler_siyahisi[i].completed = !isler_siyahisi[i].completed; 
                    break;
                }
            }
            yaddaSAXLA_Lokal();
            ekraniYenile(); 
        }

function elemaniSil(id) {
    let yeniIsler = [];
    for (let i = 0; i < isler_siyahisi.length; i++) {
        if (isler_siyahisi[i].id !== id) {
            yeniIsler.push(isler_siyahisi[i]);
        }
    }
    isler_siyahisi = yeniIsler;
    if (edidIdYeri === id) edidIdYeri = null;
    yaddaSAXLA_Lokal();
    ekraniYenile();
}

function redakteBasla(id) {
    edidIdYeri = id;
    ekraniYenile();
}

function redakteYaddaSaxla() {
    let textVal = document.getElementById('edit-input-yeri').value.trim();
    if (textVal !== '') {
        for (let i = 0; i < isler_siyahisi.length; i++) {
            if (isler_siyahisi[i].id === edidIdYeri) {
                isler_siyahisi[i].text = textVal;
                break;
            }
        }
        edidIdYeri = null;
        yaddaSAXLA_Lokal();
        ekraniYenile();
    }
}

      function xatireniYaz() {
          let indeks = -1;
          for (let i = 0; i < xatireler.length; i++) {
              if (xatireler[i].gun === secilenGun && xatireler[i].ay === secilenAy) {
                  indeks = i;
                  break;
              }
          }

    let icerik = xatireMetni.value.trim();

    if (indeks > -1) {
        xatireler[indeks].text = icerik;
        xatireler[indeks].mood = secilenMood;
    } else {
        xatireler.push({ gun: secilenGun, ay: secilenAy, text: icerik, mood: secilenMood });
    }
    yaddaSAXLA_Lokal();

    const originalText = xatireYaddaSaxlaBtn.innerText;
    xatireYaddaSaxlaBtn.innerText = "Məktublandı! ✉️";
    xatireYaddaSaxlaBtn.style.background = "#3498db";

    setTimeout(() => {
        xatireYaddaSaxlaBtn.innerText = originalText;
        xatireYaddaSaxlaBtn.style.background = "#2ecc71";
        ekraniYenile(); 
    }, 1000);
}

        function pomodoroQur() {
            const widget = document.getElementById('pomodoro');
            const toggleBtn = document.getElementById('pomo-toggle-btn');
            const display = document.getElementById('timer-display');
            const startBtn = document.getElementById('timer-start-btn');
            const resetBtn = document.getElementById('timer-reset-btn');
            const workModeBtn = document.getElementById('mode-work');
            const breakModeBtn = document.getElementById('mode-break');
            const statusTxt = document.getElementById('pomo-status');

    toggleBtn.addEventListener('click', () => {
        widget.classList.toggle('collapsed');
    });

    function updateDisplay() {
        let m = timerMinutes < 10 ? '0' + timerMinutes : timerMinutes;
        let s = timerSeconds < 10 ? '0' + timerSeconds : timerSeconds;
        display.innerText = `${m}:${s}`;
    }

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

    function resetTimer() {
        clearInterval(timerInterval);
        timerIsRunning = false;
        startBtn.innerText = 'Başla';
        if (currentTimerMode === 'work') {
            timerMinutes = 25;
        } else {
            timerMinutes = 5;
        }
        timerSeconds = 0;
        updateDisplay();
    }

    resetBtn.addEventListener('click', resetTimer);

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

function ulduzSəpələ(e) {
    let randomIndeks = Math.floor(Math.random() * motivasiyaSozleri.length);
    sozYeri.innerText = motivasiyaSozleri[randomIndeks];
    let x = e.clientX;
    let y = e.clientY;

    for (let i = 0; i < 5; i++) {
        let p = document.createElement('span');
        p.className = 'sparkle-particle';
        p.innerText = '✨';
        p.style.top = y + 'px';
        p.style.left = x + 'px';

        let bucaq = Math.random() * Math.PI * 2;
        let suret = Math.random() * 3 + 2;
        let mx = Math.cos(bucaq) * suret * 25;
        let my = Math.sin(bucaq) * suret * 25;

        p.style.setProperty('--x', mx + 'px');
        p.style.setProperty('--y', my + 'px');

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
    }
}

         function hadiseleriQur() {
             teqvimBtn.addEventListener('click', (e) => {
                 e.stopPropagation();
                 teqvimAciqdir = !teqvimAciqdir;
                 teqvimPenceresei.style.display = teqvimAciqdir ? 'block' : 'none';
             });

    buGunBtn.addEventListener('click', () => {
        secilenGun = 4; 
        secilenAy = 'İYUN';
        edidIdYeri = null;
        teqvimAciqdir = false;
        teqvimPenceresei.style.display = 'none';
        ekraniYenile();
    });

    document.addEventListener('mousedown', (e) => {
        let klWrapper = document.querySelector('.calendar-wrapper-fixed');
        if (teqvimAciqdir && !klWrapper.contains(e.target)) {
            teqvimAciqdir = false;
            teqvimPenceresei.style.display = 'none';
        }
    });

    xatireYaddaSaxlaBtn.addEventListener('click', xatireniYaz);

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                secilenMood = '';
            } else {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                secilenMood = btn.dataset.mood;
            }
        });
    });

    for(let i = 1; i <= 12; i++) {
        let el = document.getElementById(`star${i}`);
        if(el) el.addEventListener('click', ulduzSəpələ);
    }
}
    window.onload = baslat;