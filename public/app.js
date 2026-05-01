const firebaseConfig = {
    apiKey: "AIzaSyB9GuAwpPD3gOsQ55sRtWZgQkxnLDZHpE0",
    authDomain: "javorisbest.firebaseapp.com",
    projectId: "javorisbest",
    storageBucket: "javorisbest.firebasestorage.app",
    messagingSenderId: "811514773223",
    appId: "1:811514773223:web:2be98250be675db5882c42"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// AKTIVACE OFFLINE DATABÁZE
firebase.firestore().enablePersistence()
  .catch((err) => console.error("Persistence selhala", err));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

async function addSong() {
    const name = document.getElementById('songName').value;
    const url = document.getElementById('githubUrl').value;
    if (!name || !url) return alert("Vyplň vše!");

    try {
        await db.collection('songs').add({
            name: name,
            url: url,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('songName').value = "";
        document.getElementById('githubUrl').value = "";
        loadSongs();
    } catch (e) { alert("Chyba při ukládání!"); }
}

// NOVÁ FUNKCE: Mazání písničky
async function deleteSong(id) {
    if(confirm("Opravdu smazat?")) {
        await db.collection('songs').doc(id).delete();
        loadSongs();
    }
}

async function loadSongs() {
    const playlist = document.getElementById('playlist');
    try {
        // Načítání funguje i offline díky persistence
        const snapshot = await db.collection('songs').orderBy('createdAt', 'desc').get();
        playlist.innerHTML = "";
        
        if (snapshot.empty) {
            playlist.innerHTML = "<p class='empty-msg'>Knihovna je prázdná.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const song = doc.data();
            playlist.innerHTML += `
                <div class="song-card">
                    <div class="card-header">
                        <span class="song-title">${song.name}</span>
                        <button class="delete-btn" onclick="deleteSong('${doc.id}')">🗑️</button>
                    </div>
                    <audio controls preload="metadata" src="${song.url}"></audio>
                </div>
            `;
        });
    } catch (e) { playlist.innerHTML = "<p>Offline režim aktivní, ale data chybí.</p>"; }
}

loadSongs();