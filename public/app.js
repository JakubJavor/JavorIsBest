const firebaseConfig = {
    apiKey: "AIzaSyB9GuAwpPD3gOsQ55sRtWZgQkxnLDZHpE0",
    authDomain: "javorisbest.firebaseapp.com",
    projectId: "javorisbest",
    storageBucket: "javorisbest.firebasestorage.app",
    messagingSenderId: "811514773223",
    appId: "1:811514773223:web:2be98250be675db5882c42"
};

// Inicializace Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- NOVÉ: Zapnutí offline ukládání databáze ---
firebase.firestore().enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.log('Persistence selhala: Více otevřených tabů');
      } else if (err.code == 'unimplemented') {
          console.log('Prohlížeč nepodporuje offline databázi');
      }
  });

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

async function addSong() {
    const name = document.getElementById('songName').value;
    const url = document.getElementById('githubUrl').value;
    const status = document.getElementById('status');

    if (!name || !url) return alert("Vyplň název i URL!");
    if (!url.startsWith('https://')) return alert("URL musí začínat https://");

    status.innerText = "Ukládám do databáze...";

    try {
        await db.collection('songs').add({
            name: name,
            url: url,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        status.innerText = "Uloženo!";
        document.getElementById('songName').value = "";
        document.getElementById('githubUrl').value = "";
        loadSongs();
    } catch (e) {
        status.innerText = "Chyba: Zkontroluj Firestore Rules!";
    }
}

async function loadSongs() {
    const playlist = document.getElementById('playlist');
    try {
        // Načte data buď ze serveru, nebo z lokální paměti (pokud jsi offline)
        const snapshot = await db.collection('songs').orderBy('createdAt', 'desc').get();
        playlist.innerHTML = "";
        
        if (snapshot.empty) {
            playlist.innerHTML = "<p style='text-align:center; opacity:0.5;'>Knihovna je prázdná.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const song = doc.data();
            playlist.innerHTML += `
                <div class="song-card">
                    <span class="song-title">${song.name}</span>
                    <audio controls preload="none" src="${song.url}"></audio>
                </div>
            `;
        });
    } catch (e) {
        playlist.innerHTML = "<p>Chyba načítání databáze.</p>";
    }
}

loadSongs();