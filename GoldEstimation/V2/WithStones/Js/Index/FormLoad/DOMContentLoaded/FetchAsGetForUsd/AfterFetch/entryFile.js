import { StartFunc as Status200 } from "./status200.js";
// import { StartFunc as Status409 } from "./status409.js";
// import { StartFunc as StartFuncFromStatus401 } from "./status401.js";

let StartFunc = async ({ inResponse }) => {
    let jVarLocalResponse = await inResponse;

    if (jVarLocalResponse.status === 200) {
        let jVarLocalDataAsJson = await jVarLocalResponse.json();
        Status200({ inResponseAsJson: jVarLocalDataAsJson });
    };

    if (jVarLocalResponse.status === 403) {
        localStorage.setItem("USDToINR", 91.5241);
    };

    // if (jVarLocalResponse.status === 409) {
    //     let jVarLocalSavedPk = await jVarLocalResponse.text();
    //     Status409({ inResponse: jVarLocalSavedPk });
    // };

    // if (jVarLocalResponse.status === 401) {
    //     let jVarLocalJsonResponse = await jVarLocalResponse.json();
    //     StartFuncFromStatus401({ inResponse: jVarLocalJsonResponse });
    // };
};

export { StartFunc };