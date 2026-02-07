import { StartFunc as StartFuncFromFetchAsGet } from "./FetchAsGet/entryFile.js";
import { StartFunc as StartFuncFromFetchAsGetForUsd } from "./FetchAsGetForUsd/entryFile.js";

const StartFunc = () => {
    StartFuncFromFetchAsGet();
    StartFuncFromFetchAsGetForUsd();
};

export { StartFunc };
