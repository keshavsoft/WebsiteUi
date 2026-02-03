// import { StartFunc as StartFuncFormForSpeechRecog } from "./forSpeechRecog.js";
import { StartFunc as StartFuncFromForDom } from "./forDom.js";
import { StartFunc as StartFuncFormForSpeechRecog } from "./ForSpeechRecog/entryFile.js";

const StartFunc = () => {
    StartFuncFormForSpeechRecog();
    StartFuncFromForDom();
};

StartFunc();