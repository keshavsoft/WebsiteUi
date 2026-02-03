const StartFunc = () => {
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
    };

    function clearHighlight() {
        document.querySelectorAll(".section-card").forEach(c => c.classList.remove("active"));
    };
};

export { StartFunc };
