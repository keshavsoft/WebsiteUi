import { StartFunc as Status200 } from "./status200.js";
// import { StartFunc as Status409 } from "./status409.js";
// import { StartFunc as StartFuncFromStatus401 } from "./status401.js";

let StartFunc = async ({ inResponse }) => {
    let jVarLocalResponse = await inResponse;
    // debugger;
    const contentType = inResponse.headers.get('Content-Type');

    if (jVarLocalResponse.status === 200) {
        if (contentType === "text/plain") {
            let jVarLocalDataAsText = await jVarLocalResponse.text();
            let jVarLocalDataAsTextAsArray = jVarLocalDataAsText.split("\n");
            let jVarLocalDataAsTextAsArray8thLine = jVarLocalDataAsTextAsArray[8].split("\t");
            let jVarLocalGoldRate = jVarLocalDataAsTextAsArray8thLine[3];
            console.log("jVarLocalGoldRate : ", jVarLocalGoldRate);
            jFLocalToInputrate(jVarLocalGoldRate);
            calculateGold();
        } else {
            let jVarLocalDataAsJson = await jVarLocalResponse.json();
            Status200({ inResponseAsJson: jVarLocalDataAsJson });
        };
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

let jFLocalToInputrate = (inValue) => {
    let jVarLocalHtmlId = 'rate';
    let jVarLocalrate = document.getElementById(jVarLocalHtmlId);

    if (jVarLocalrate === null === false) {
        jVarLocalrate.value = inValue;
    };
};

export { StartFunc };