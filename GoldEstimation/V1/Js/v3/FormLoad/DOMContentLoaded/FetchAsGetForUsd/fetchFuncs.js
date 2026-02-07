import getUrlJson from './getUrl.json' with {type: 'json'};

let StartFunc = async () => {
    let jVarLocalFetchUrl = getUrlJson.GetEndPoint;

    let response = await fetch(jVarLocalFetchUrl);

    return await response;
};

export { StartFunc };