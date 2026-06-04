let secilenGun = 4; 
let secilenAy = 'İYUN';
let teqvimAciqdir = false;
let edidIdYeri = null; 

let isler_siyahisi = []; 
let xatireler = []; 

const motivasiyaSozleri = [
    "✨ Uğurlar! Addım-addım hədəfə doğru!",
    "🚀 Möhtəşəm! Bu gün sənin günündür!",
    "🔥 Super! Enerjini yüksek saxla!",
    "🧠 Sən bacaracaqsan, sadəcə davam et!",
    "🌟 Diqqətini hədəfə yönəlt, uğurlar!",
    "💎 Potensialın limitsizdir, inan özünə!",
    "🎯 Möhtəşəm fokus! Dünəndən daha güclüsən!"
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


function baslat() {
    let randomIndeks = Math.floor(Math.random() * motivasiyaSozleri.length);
    sozYeri.innerText = motivasiyaSozleri[randomIndeks];

    fetch('https://jsonplaceholder.typicode.com/todos?_limit=4')
        .then(res => res.json())
        .then(data => {
            isler_siyahisi = data.map((item, index) => {
                let mətn = item.title;
                if (index === 0) mətn = 'EduPlanner layihə kodlarını yoxla';
                if (index === 1) mətn = 'Müəllimin dediyi çatışmazlıqları düzəlt';
                if (index === 2) mətn = 'Yeni mövzu üzərində işlə';
                if (index === 3) mətn = 'Kitab oxu və konspekt elə';

                return {
                    id: item.id,
                    text: mətn,
                    completed: false, 
                    gun: 4,          
                    ay: 'İYUN'
                };
            });
            ekraniYenile();
        })
        .catch(err => {
            console.log("Məlumat gəlmədi, API xətası:", err);
            ekraniYenile();
        });

    hadiseleriQur();
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
            kart.innerHTML = `
                <span class="day-name">${ad}</span>
                <span class="day-date">${g}</span>
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
}

    gunlerinYeri.innerHTML = '';
    for (let d = 1; d <= 30; d++) { 
        let gunKart = document.createElement('span');
        if (d === secilenGun) {
            gunKart.className = 'active-day';
        } else {
            gunKart.className = 'clickable-day';
            gunKart.addEventListener('click', () => {
                secilenGun = d;
                teqvimAciqdir = false;
                teqvimPenceresei.style.display = 'none';
                edidIdYeri = null;
                ekraniYenile();
            });
        }
        gunKart.innerText = d;
        gunlerinYeri.appendChild(gunKart);
    }

    aktivSiyahisi.innerHTML = '';
    bitenSiyahisi.innerHTML = '';

    let bugununIsleri = isler_siyahisi.filter(t => t.gun === secilenGun && t.ay === secilenAy);
    let aktivler = bugununIsleri.filter(t => !t.completed);
    let bitenler = bugununIsleri.filter(t => t.completed);

    aktivSay.innerText = `Aktiv Tapşırıqlar (${aktivler.length})`;
    bitenSay.innerText = `Tamamlananlar (${bitenler.length})`;

    if (edidIdYeri !== null) {
        let redakteOlan = isler_siyahisi.find(t => t.id === edidIdYeri);
        inputBlok.innerHTML = `
            <div class="edit-container">
                <input type="text" id="edit-input-yeri" class="todo-input" value="${redakteOlan.text}" />
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

    aktivler.forEach(item => {
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
    });

    bitenler.forEach(item => {
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
    });

    document.querySelectorAll('.chk-click').forEach(box => {
        box.addEventListener('change', (e) => statusDeyis(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('.btn-edit').forEach(b => {
        b.addEventListener('click', (e) => redakteBasla(Number(e.target.dataset.id)));
    });
    document.querySelectorAll('.btn-del').forEach(b => {
        b.addEventListener('click', (e) => elemaniSil(Number(e.target.dataset.id)));
    });

    let oGununQeydi = xatireler.find(n => n.gun === secilenGun && n.ay === secilenAy);
    xatireMetni.value = oGununQeydi ? oGununQeydi.text : '';
function yeniTodoElaveEt(e) {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        isler_siyahisi.push({
            id: Date.now(),
            text: e.target.value.trim(),
            completed: false,
            gun: secilenGun,
            ay: secilenAy
        });
        ekraniYenile();
    }
}

function statusDeyis(id) {
    isler_siyahisi = isler_siyahisi.map(x => x.id === id ? { ...x, completed: !x.completed } : x);
    ekraniYenile();
}

function elemaniSil(id) {
    isler_siyahisi = isler_siyahisi.filter(x => x.id !== id);
    if (edidIdYeri === id) edidIdYeri = null;
    ekraniYenile();
}

function redakteBasla(id) {
    edidIdYeri = id;
    ekraniYenile();
}

function redakteYaddaSaxla() {
    let textVal = document.getElementById('edit-input-yeri').value.trim();
    if (textVal !== '') {
        isler_siyahisi = isler_siyahisi.map(x => x.id === edidIdYeri ? { ...x, text: textVal } : x);
        edidIdYeri = null;
        ekraniYenile();
    }
}

function xatireniYaz() {
    let index = xatireler.findIndex(n => n.gun === secilenGun && n.ay === secilenAy);
    let icorik = xatireMetni.value.trim();

    if (index > -1) {
        xatireler[index].text = icorik;
    } else {
        xatireler.push({ gun: secilenGun, ay: secilenAy, text: icorik });
    }
    alert("Qeyd yadda saxlanıldı! 📝");
    ekraniYenile();
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

    for(let i = 1; i <= 12; i++) {
        let el = document.getElementById(`star${i}`);
        if(el) {
            el.addEventListener('click', ulduzSəpələ);
        }
    }
}

window.onload = baslat;