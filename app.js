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