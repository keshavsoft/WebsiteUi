const liveTextEl = document.getElementById("liveText");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;        // keep listening
recognition.interimResults = true;    // show partial text
recognition.lang = "en-US";

const output = document.getElementById("output");

recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        console.log("aaaaaaaa : ", transcript, result);
        if (!transcript) continue;

        if (result.isFinal) {
            finalTranscript += transcript + " ";
        } else {
            interimTranscript += transcript + " ";
        };

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
};

function splitIntoSentences(text) {
    return text
        .split(/(?<=[.?!।])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
};

document.getElementById("toggleRecordBtn").onclick = () => recognition.start();
// document.getElementById("stop").onclick = () => recognition.stop();