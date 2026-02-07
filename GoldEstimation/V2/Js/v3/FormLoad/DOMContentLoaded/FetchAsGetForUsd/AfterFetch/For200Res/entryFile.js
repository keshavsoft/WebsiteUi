let StartFunc = ({ inResponseAsJson }) => {
    console.log("inResponseAsJson : ", inResponseAsJson);

    localStorage.setItem("USDToINR", inResponseAsJson.conversion_rates.INR);
};

export { StartFunc };