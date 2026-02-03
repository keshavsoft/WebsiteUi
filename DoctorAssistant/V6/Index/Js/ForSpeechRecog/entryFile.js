import { StartFunc as StartFuncFromOnResult } from "./onResult.js";
import { StartFunc as StartFuncFromOnEnd } from "./onEnd.js";

const StartFunc = () => {
    recognition.onresult = StartFuncFromOnResult;
    recognition.onend = StartFuncFromOnEnd;
};

export { StartFunc };
