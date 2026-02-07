let StartFunc = ({ inResponse }) => {
    Swal.fire({
        text: `${inResponse}`,
        icon: "error",
        title: "check"
    });
};

export { StartFunc };