function statusToColor(status) {
    if (status >= 200 && status < 300) {
        return 32;
    } else if (status >= 300 && status < 400) {
        return 33;
    } else if (status >= 400 && status < 500) {
        return 36;
    } else {
        return 31;
    }
}
function summary(status, method, statusText, url) {
    return `\x1B[${statusToColor(
        status
    )}m${method} [${status} ${statusText}]\x1B[0m : \x1B[1m${url}\x1B[0m\n`;
}

function request(log) {
    console.group(
        summary(log.status, log.method, log.statusText, log.url)
    );
    if (log.header) {
        console.log("\n--Request Header---------------------------\n");
        console.log(JSON.stringify(log.header, null, 2));
    }
    if (log.body) {
        console.log("\n--Request Body-----------------------------\n");
        console.log(log.body);
    }
    if (log.response) {
        console.log("\n--Response Body----------------------------\n");
        console.log(log.response);
    }
    if (log.map) {
        console.log("\n--Map Response Body------------------------\n");
        console.log(log.map);
    }
    console.log("\n--End--------------------------------------\n\n");
    console.groupEnd();
}


export default {
    summary,
    request
}