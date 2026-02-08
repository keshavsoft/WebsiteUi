import ConfigJson from "../../../../../../../../Config.json" with {type: 'json'};

let StartFunc = ({ inResponse }) => {
    // const jVarLocalRedirectUrl = ConfigJson.Protected.RedirectUrl;

    // window.location.href = jVarLocalRedirectUrl;

    jFLocalAddUrlParams({ inSuccessUrl: "../ShowAll/AsIs.html" });
    // console.log("aaaaaaa : ", jVarLocalRedirectUrl);
    // http://localhost:9113/V5/StudentNames/pages/ShowAll/AsIs.html#top

};

const jFLocalAddUrlParams = ({ inSuccessUrl }) => {
    const jVarLocalRedirectUrl = ConfigJson.Protected.RedirectUrl;

    const url = new URL(window.location.href);

    let NewURl = new URL(jVarLocalRedirectUrl, url);

    NewURl.searchParams.append('SuccessUrl', inSuccessUrl);
    window.location.href = NewURl.href;
};


export { StartFunc };