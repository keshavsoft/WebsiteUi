// ---- GLOBALS ----
let recognition = null;
let recognizing = false;

let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const liveTextEl = document.getElementById("liveText");
const finalNotesListEl = document.getElementById("finalNotesList");
const toggleRecordBtn = document.getElementById("toggleRecordBtn");
const toggleRecordLabel = document.getElementById("toggleRecordLabel");
const downloadTextBtn = document.getElementById("downloadTextBtn");
const downloadAudioBtn = document.getElementById("downloadAudioBtn");
const clearBtn = document.getElementById("clearBtn");
const languageSelect = document.getElementById("languageSelect");
const patientNameInput = document.getElementById("patientName");
const visitIdInput = document.getElementById("visitId");

// ---- SPEECH RECOGNITION SETUP ----
function initSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        toggleRecordBtn.disabled = true;
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageSelect.value;

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            if (!transcript) continue;

            if (result.isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript + " ";
            }
        }

        if (interimTranscript) {
            liveTextEl.textContent = interimTranscript;
            liveTextEl.classList.remove("placeholder");
        } else if (!finalTranscript && recognizing) {
            liveTextEl.textContent = "Listening…";
        }

        if (finalTranscript) {
            const sentences = splitIntoSentences(finalTranscript);
            sentences.forEach((s) => addNote(s));
            liveTextEl.textContent = "";
            liveTextEl.classList.add("placeholder");
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.textContent = "Error: " + event.error;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            alert("Mic permission blocked or speech service not allowed. Check site permissions.");
        }
    };

    recognition.onend = () => {
        if (recognizing) {
            recognizing = false;
            updateUIForRecordingState();
        }
    };
}

function splitIntoSentences(text) {
    return text
        .split(/(?<=[.?!।])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

// ---- FINAL NOTES: ADD / EDIT / DELETE ----
function addNote(text) {
    if (!text) return;

    const li = document.createElement("li");
    li.classList.add("note-item");

    const textSpan = document.createElement("span");
    textSpan.classList.add("note-text");
    textSpan.textContent = text;

    const actions = document.createElement("div");
    actions.classList.add("note-actions");

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn edit";
    editBtn.title = "Edit this line";
    editBtn.textContent = "✏️";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn delete";
    deleteBtn.title = "Delete this line";
    deleteBtn.textContent = "🗑️";

    // EDIT NOTE
    editBtn.addEventListener("click", () => {
        const oldText = textSpan.textContent;
        const updated = prompt("Edit note:", oldText);
        if (updated === null) return;
        const newText = updated.trim();
        if (!newText) return;
        textSpan.textContent = newText;
    });

    // DELETE NOTE
    deleteBtn.addEventListener("click", () => {
        li.remove();
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(textSpan);
    li.appendChild(actions);
    finalNotesListEl.appendChild(li);
}

function getFinalNotesLines() {
    return Array.from(finalNotesListEl.querySelectorAll(".note-text"))
        .map((el) => el.textContent.trim())
        .filter((t) => t.length > 0);
}

// ---- AUDIO RECORDING ----
async function startAudioRecording() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(currentStream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.start();
    } catch (err) {
        console.error("Microphone access error:", err);
        alert("Unable to access microphone. Please allow mic permission.");
    }
}

function stopAudioRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
        currentStream = null;
    }
}

// ---- UI STATE ----
function updateUIForRecordingState() {
    if (recognizing) {
        statusIndicator.classList.add("recording");
        statusText.textContent =
            "Listening to patient… (" +
            languageSelect.options[languageSelect.selectedIndex].text +
            ")";
        toggleRecordLabel.textContent = "Pause Listening";
    } else {
        statusIndicator.classList.remove("recording");
        statusText.textContent = "Mic is idle";
        toggleRecordLabel.textContent = "Start Listening";
    }
}

function buildFileBaseName() {
    const patientRaw = patientNameInput.value.trim() || "patient";
    const visitRaw = visitIdInput.value.trim();

    const sanitize = (str) =>
        str
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");

    let base = sanitize(patientRaw);
    if (visitRaw) base += "-" + sanitize(visitRaw);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    return base + "-" + timestamp;
}

// ---- EVENT HANDLERS ----
toggleRecordBtn.addEventListener("click", async () => {
    if (!recognition) {
        initSpeechRecognition();
        if (!recognition) return;
    }

    if (!recognizing) {
        try {
            recognition.lang = languageSelect.value;
            recognition.start();
            recognizing = true;
            liveTextEl.textContent = "Listening…";
            liveTextEl.classList.remove("placeholder");
            updateUIForRecordingState();
            await startAudioRecording();
        } catch (err) {
            console.error("Error starting recognition:", err);
            alert("Error starting speech recognition: " + err.message);
        }
    } else {
        recognizing = false;
        recognition.stop();
        stopAudioRecording();
        liveTextEl.textContent = "";
        liveTextEl.classList.add("placeholder");
        updateUIForRecordingState();
    }
});

languageSelect.addEventListener("change", () => {
    if (recognition) {
        recognition.lang = languageSelect.value;
    }
    if (recognizing && recognition) {
        recognizing = false;
        recognition.stop();
        stopAudioRecording();
        liveTextEl.textContent = "";
        liveTextEl.classList.add("placeholder");
        updateUIForRecordingState();
    }
});

downloadTextBtn.addEventListener("click", () => {
    const lines = getFinalNotesLines();
    if (lines.length === 0) {
        alert("No final notes to download.");
        return;
    }
    const text = lines.map((l) => "- " + l).join("\n");
    const fileBase = buildFileBaseName();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileBase + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

downloadAudioBtn.addEventListener("click", () => {
    if (audioChunks.length === 0) {
        alert("No audio recorded yet.");
        return;
    }
    const fileBase = buildFileBaseName();
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileBase + ".webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all final notes and audio?")) return;
    finalNotesListEl.innerHTML = "";
    liveTextEl.textContent = "Press “Start Listening” and ask the patient to speak…";
    liveTextEl.classList.add("placeholder");
    audioChunks = [];
});

// Init: check support
(function () {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        toggleRecordBtn.disabled = true;
    }
})();