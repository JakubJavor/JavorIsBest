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

// Aktivace offline databáze
firebase.firestore().enablePersistence().catch(err => console.error(err));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

async function addSong() {
    const name = document.getElementById('songName').value;
    const url = document.getElementById('githubUrl').value;
    if (!name || !url) return alert("Musíš vyplnit název i URL!");

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

async function deleteSong(id) {
    if(confirm("Smazat tuto písničku z knihovny?")) {
        await db.collection('songs').doc(id).delete();
        loadSongs();
    }
}

async function loadSongs() {
    const playlist = document.getElementById('playlist');
    try {
        const snapshot = await db.collection('songs').orderBy('createdAt', 'desc').get();
        playlist.innerHTML = "";
        
        if (snapshot.empty) {
            playlist.innerHTML = "<p class='empty-msg'>Knihovna je zatím prázdná.</p>";
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
                    <audio controls preload="metadata" crossorigin="anonymous" src="${song.url}"></audio>
                </div>
            `;
        });
    } catch (e) { 
        playlist.innerHTML = "<p class='empty-msg'>Offline režim: Písničky se načítají z paměti telefonu.</p>"; 
    }
}

loadSongs();