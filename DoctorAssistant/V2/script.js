// ---- GLOBALS ----
let recognition = null;
let recognizing = false;

let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const liveTextEl = document.getElementById("liveText");
const pointsListEl = document.getElementById("pointsList");
const finalTextEl = document.getElementById("finalText");
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
            sentences.forEach((s) => addPoint(s));
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

// ---- ADD POINT WITH EDIT & DELETE ----
function addPoint(text) {
    if (!text) return;

    const li = document.createElement("li");
    li.classList.add("point-item");

    const textSpan = document.createElement("span");
    textSpan.classList.add("point-text");
    textSpan.textContent = text;

    const actions = document.createElement("div");
    actions.classList.add("point-actions");

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

    // EDIT POINT
    editBtn.addEventListener("click", () => {
        const oldText = textSpan.textContent;
        const updated = prompt("Edit point:", oldText);
        if (updated === null) return;
        const newText = updated.trim();
        if (!newText) return;

        textSpan.textContent = newText;

        const lines = finalTextEl.value.split("\n");
        const idx = lines.findIndex((line) => line.includes(oldText));
        if (idx !== -1) {
            const hasDash = lines[idx].trim().startsWith("-");
            lines[idx] = (hasDash ? "- " : "") + newText;
            finalTextEl.value = lines.join("\n");
        }
    });

    // DELETE POINT
    deleteBtn.addEventListener("click", () => {
        const lineText = textSpan.textContent;
        li.remove();

        const lines = finalTextEl.value.split("\n");
        const filtered = lines.filter((line) => !line.includes(lineText));
        finalTextEl.value = filtered.join("\n");
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(textSpan);
    li.appendChild(actions);
    pointsListEl.appendChild(li);

    const prefix = finalTextEl.value.trim().length > 0 ? "\n" : "";
    finalTextEl.value += prefix + "- " + text;
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
    const text = finalTextEl.value.trim();
    if (!text) {
        alert("No notes to download.");
        return;
    }
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
    if (!confirm("Clear all captured points, final notes and audio?")) return;
    pointsListEl.innerHTML = "";
    finalTextEl.value = "";
    liveTextEl.textContent = "Press “Start Listening” and ask the patient to speak…";
    liveTextEl.classList.add("placeholder");
    audioChunks = [];
});

// Init
(function () {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        toggleRecordBtn.disabled = true;
    }
})();