// import { StartFunc as StartFuncFormForSpeechRecog } from "./forSpeechRecog.js";
import { StartFunc as StartFuncFromForDom } from "./forDom.js";
import { StartFunc as StartFuncFormForSpeechRecog } from "./ForSpeechRecog/entryFile.js";
import { StartFunc as StartFuncFromAddListeners } from "./addListeners.js";

const StartFunc = () => {
    StartFuncFormForSpeechRecog();
    StartFuncFromForDom();
    StartFuncFromAddListeners();
};

StartFunc();