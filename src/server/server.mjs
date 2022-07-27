import http from "http";
import fs from "fs";

const PORT = 8014;

const PREFIX = ".";
const protocol = "http://";


function fileexist(filepath) {
    try {
        fs.accessSync(filepath, fs.constants.R_OK);
        return true;
    }
    catch (e) {
        return false;
    }
}


http.createServer((req, res) => {

    setCors(res);
    const uri = new URL(req.url || "", `${protocol}${req.headers.host}`);
    const method = (req.method || "GET").toUpperCase();
    const filepath = uri.pathname.endsWith("/") ? `${PREFIX}${uri.pathname}index.html` : `${PREFIX}${uri.pathname}`;
    if (fileexist(filepath)) {
        if (filepath.endsWith(".html")) {
            res.writeHead(200, { "Content-Type": "text/html" });
        } else if (filepath.endsWith(".js")) {
            res.writeHead(200, { "Content-Type": "text/javascript" });
        } else if (filepath.endsWith(".css")) {
            res.writeHead(200, { "Content-Type": "text/css" });
        } else if (filepath.endsWith(".json")) {
            res.writeHead(200, { "Content-Type": "application/json" });
        } else {
            res.writeHead(200, { "Content-Type": "text/plain" });
        }
        res.end(fs.readFileSync(filepath));
    } else {
        console.log("COMMAND:", method, uri.href);
        console.log(uri);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            "code": 0,
            "msg": "success",
            "command": `${method} ${uri.href}`
        }));
    }



}).listen(PORT);

function setCors(res) {
    // res.setHeader("Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("allow", "POST, GET, OPTIONS, HEAD");
}