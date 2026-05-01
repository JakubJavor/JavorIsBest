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

// Zapnutí offline ukládání databáze
firebase.firestore().enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('Persistence selhala: Více otevřených tabů');
      } else if (err.code == 'unimplemented') {
          console.warn('Prohlížeč nepodporuje offline databázi');
      }
  });

// Registrace Service Workeru pro PWA a offline audio
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registrován', reg))
            .catch(err => console.error('SW selhal', err));
    });
}

/**
 * Pomocná funkce: Převede klasický GitHub odkaz na přímý (Raw) odkaz na soubor
 */
function formatGithubUrl(url) {
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }
    return url;
}

async function addSong() {
    const nameInput = document.getElementById('songName');
    const urlInput = document.getElementById('githubUrl');
    const status = document.getElementById('status');

    let name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name || !url) return alert("Vyplň název i URL!");
    
    // Automatická oprava odkazu před uložením
    url = formatGithubUrl(url);

    status.innerText = "Ukládám do databáze...";

    try {
        await db.collection('songs').add({
            name: name,
            url: url,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        status.innerText = "Uloženo!";
        nameInput.value = "";
        urlInput.value = "";
        loadSongs(); // Refresh seznamu
    } catch (e) {
        console.error(e);
        status.innerText = "Chyba: Zkontroluj Firestore Rules!";
    }
}

async function loadSongs() {
    const playlist = document.getElementById('playlist');
    try {
        // Snapshot poslouchá na změny v reálném čase
        db.collection('songs').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
            playlist.innerHTML = "";
            
            if (snapshot.empty) {
                playlist.innerHTML = "<p style='text-align:center; opacity:0.5;'>Knihovna je prázdná.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const song = doc.data();
                // Přidán onerror handler pro diagnostiku špatných odkazů
                playlist.innerHTML += `
                    <div class="song-card">
                        <span class="song-title">${song.name}</span>
                        <audio controls preload="metadata" 
                            src="${song.url}?t=${new Date().getTime()}"
                            onerror="console.error('Nelze načíst audio: ${song.url}')">
                        </audio>
                    </div>
                `;
            });
        });
    } catch (e) {
        playlist.innerHTML = "<p>Chyba načítání databáze.</p>";
        console.error(e);
    }
}

// Spuštění při startu
loadSongs();