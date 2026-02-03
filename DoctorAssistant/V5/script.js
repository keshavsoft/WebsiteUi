
const StartFunc = () => {
    const liveTextEl = document.getElementById("liveText");
    const finalNotesListEl = document.getElementById("finalNotesList");

    recognition.continuous = true;        // keep listening
    recognition.interimResults = true;    // show partial text
    recognition.lang = "en-US";

    const output = document.getElementById("liveText");
    const statusText = document.getElementById("statusText");
    // addNote("result");
    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();
            // console.log("aaaaaaaa : ", transcript);
            // addNote(transcript);
            if (!transcript) continue;

            if (result.isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript + " ";
            };
        };
        addNote(interimTranscript);
        console.log("aaaaaaaaaapt : ", finalTranscript);
        console.log("bbbbbbbbb : ", interimTranscript);

        // if (interimTranscript) {
        //     liveTextEl.textContent = interimTranscript;
        //     liveTextEl.classList.remove("placeholder");
        // } else if (!finalTranscript && recognizing) {
        //     liveTextEl.textContent = "Listening…";
        // }

        // if (finalTranscript) {
        //     const sentences = splitIntoSentences(finalTranscript);
        //     sentences.forEach((s) => addNote(s));
        //     liveTextEl.textContent = "";
        //     liveTextEl.classList.add("placeholder");
        // };
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.textContent = "Error: " + event.error;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            alert("Mic permission blocked or speech service not allowed. Check site permissions.");
        }
    };

    function splitIntoSentences(text) {
        return text
            .split(/(?<=[.?!।])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    };

    // document.getElementById("stop").onclick = () => recognition.stop();
};


StartFunc();