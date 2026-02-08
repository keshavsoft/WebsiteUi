import { StartFunc as StartFuncFor200Res } from "./For200Res/entryFile.js";

let StartFunc = ({ inResponseAsJson }) => {
    StartFuncFor200Res({ inResponseAsJson });
};

export { StartFunc };