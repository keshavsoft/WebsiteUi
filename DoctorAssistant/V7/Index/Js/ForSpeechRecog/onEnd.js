const StartFunc = () => {
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

export { StartFunc };
