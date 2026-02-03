const StartFunc = () => {
    const element = document.getElementById("Summary");
    element.addEventListener("click", () => {
        console.log("Summary element clicked");
        IscontinuousListening = true;
        recognition.start();
    });

};

export { StartFunc };