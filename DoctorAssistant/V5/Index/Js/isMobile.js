// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = new SpeechRecognition();

const StartFunc = () => {
    console.log("recognition : ", recognition);

    recognition.continuous = true;        // keep listening
    recognition.interimResults = true;    // show partial text
    recognition.lang = "en-US";

    const output = document.getElementById("liveText");
    const statusText = document.getElementById("statusText");

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();

            if (!transcript) continue;

            if (result.isFinal) {
                finalTranscript += transcript + " ";
            };
        };

        addNote(finalTranscript);
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
            recognition.start();
        };
    };

    function splitIntoSentences(text) {
        return text
            .split(/(?<=[.?!।])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    };

    // document.getElementById("stop").onclick = () => recognition.stop();
};

// ---- FINAL NOTES: ADD / EDIT / DELETE ----
function addNote(text) {
    const finalNotesListEl = document.getElementById("finalNotesList");

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
};

export { StartFunc };
