let audioStream, mediaRecorder;
let chunks = [];
let whisper;

async function initWhisper() {
    whisper = await WhisperFactory.create({
        corePath: "whisper.wasm",
        modelPath: "ggml-base.en.bin",
        useWebGPU: true
    });
    console.log("Whisper ready.");
}

document.getElementById("start").onclick = async () => {
    await initWhisper();

    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(audioStream);

    chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const buffer = await audioBlob.arrayBuffer();

        const result = await whisper.transcribe(buffer);
        document.getElementById("output").textContent = result.text;
    };

    mediaRecorder.start();
};

document.getElementById("stop").onclick = () => {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(t => t.stop());
};
