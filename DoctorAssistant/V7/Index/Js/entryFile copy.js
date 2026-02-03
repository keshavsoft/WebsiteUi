/* 🔔 BEEP */
let audioCtx = null;
function beep(f, d) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = f; g.gain.value = 0.08;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); setTimeout(() => o.stop(), d);
}
const beepStart = () => beep(880, 120);
const beepStop = () => beep(440, 160);

/* 🎙 SPEECH */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = false;

let recognizing = false;
let activeSection = null;
let activeButton = null;
let session = 0, activeSession = null;

/* 🗑️ UNDO */
let lastDeleted = null, lastParent = null, undoTimer = null;

recognition.onresult = e => {
    if (activeSession !== session || !activeSection) return;
    const r = e.results[e.results.length - 1];
    if (r.isFinal) addNote(r[0].transcript.trim());
};

recognition.onend = () => {
    // Auto-restart ONLY if user has not paused
    if (recognizing && activeSection) {
        try {
            recognition.start();
        } catch (e) {
            // iOS can throw if start() is too fast
            setTimeout(() => {
                try { recognition.start(); } catch { }
            }, 300);
        }
    }
};

document.querySelectorAll(".section-mic").forEach(btn => {
    btn.onclick = () => {
        const sec = btn.dataset.section;
        recognizing && activeSection === sec ? stopRec() : startRec(sec, btn);
    };
});

function startRec(sec, btn) {
    try { recognition.abort(); } catch { }
    session++; activeSession = session;
    if (activeButton) activeButton.textContent = "🎙 Start Listening";
    activeSection = sec; activeButton = btn;
    btn.textContent = "⏸ Pause Listening";
    highlight(sec); updateStatus(true); beepStart();
    recognition.lang = languageSelect.value;
    recognition.start(); recognizing = true;
}

function stopRec() {
    try { recognition.abort(); } catch { }
    recognizing = false; activeSection = null; activeSession = null;
    if (activeButton) { activeButton.textContent = "🎙 Start Listening"; activeButton = null; }
    clearHighlight(); updateStatus(false); beepStop();
}

function updateStatus(on) {
    statusDot.classList.toggle("recording", on);
    statusText.textContent = on ? "Listening…" : "Mic is idle";
}

function highlight(sec) {
    document.querySelectorAll(".section-card").forEach(c => c.classList.remove("active"));
    document.querySelector(`[data-section="${sec}"]`).classList.add("active");
}
function clearHighlight() {
    document.querySelectorAll(".section-card").forEach(c => c.classList.remove("active"));
}

/* 📝 NOTES */
function addNote(text) {
    finalNotesList.appendChild(document.createElement("li")).textContent = text;
    const ul = document.getElementById(activeSection);
    if (!ul) return;

    const li = document.createElement("li");
    li.className = "note-item";

    const span = document.createElement("span");
    span.textContent = text;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const edit = document.createElement("button");
    edit.textContent = "✏️";
    edit.onclick = () => {
        const old = span.textContent;
        span.contentEditable = true;
        span.focus();
        span.onkeydown = e => {
            if (e.key === "Enter") { e.preventDefault(); span.contentEditable = false; }
            if (e.key === "Escape") { span.textContent = old; span.contentEditable = false; }
        };
    };

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = () => {
        if (!confirm("Delete this note?")) return;
        lastDeleted = li; lastParent = ul;
        ul.removeChild(li);
        showUndo();
    };

    actions.append(edit, del);
    li.append(span, actions);
    ul.appendChild(li);
}

/* ↩️ UNDO */
function showUndo() {
    undoToast.style.display = "flex";
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
        undoToast.style.display = "none";
        lastDeleted = null; lastParent = null;
    }, 5000);
}
function undoDelete() {
    if (!lastDeleted) return;
    lastParent.appendChild(lastDeleted);
    lastDeleted = null; lastParent = null;
    undoToast.style.display = "none";
}

/* 📄 HELPERS */
function clearAll() {
    document.querySelectorAll(".sheet ul").forEach(u => u.innerHTML = "");
}
function downloadText() {
    let t = "";
    document.querySelectorAll(".section-card").forEach(c => {
        t += c.querySelector("h3").innerText + "\n";
        c.querySelectorAll("li span").forEach(s => t += "- " + s.innerText + "\n");
        t += "\n";
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/plain" }));
    a.download = "OPD_Notes.txt";
    a.click();
};