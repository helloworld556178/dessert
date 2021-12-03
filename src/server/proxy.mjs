const http = require("http");

// 一个代理小工具

const HOST = "要转发的目标服务器";
const PREFIX = "http://要转发的目标服务器:目标端口";
const cookie = "需要预置的cookie";

http.createServer((req, res) => {
    const headers = { ...req.headers };
    headers["host"] = HOST;
    headers["referer"] = PREFIX + req.url;
    headers["cookie"] = cookie;
    const bs = [];
    const rs = [];

    new Promise((r, f) => {
        req.on("readable", () => {
            const b = req.read();
            if (b !== null) {
                bs.push(b);
            }
            if (res.writableFinished === false) {
                r();
            }
        });
        req.on("error", ev => {
            console.warn(ev.message);
            setCors(res);
            res.end(JSON.stringify({
                "code": 1,
                "msg": "failure"
            }));
            f("req");
        });
    }).then(() => new Promise((r, f) => {
        const t = http.request(PREFIX + req.url, {
            headers,
            method: req.method
        });
        t.on("error", ev => {
            console.warn(ev.message);
            setCors(res);
            res.end(JSON.stringify({
                code: 1,
                msg: ev.message
            }));
            f("redirect");
        });
        t.on("response", cb => {
            cb.on("end", () => {
                r([cb.statusCode, cb.headers]);
            });
            cb.on("readable", () => {
                let b = cb.read();
                while (null !== b) {
                    rs.push(b);
                    b = cb.read();
                }
            });
        });
        for (let b of bs) {
            t.write(b);
        }
        t.end();
    })).then(([status, headers]) => new Promise((r, j) => {
        res.statusCode = status;
        for (let i in headers) {
            res.setHeader(i, headers[i]);
        }
        if (status === 302) {
            for (let i in headers) {
                if (i.toLowerCase() === "location") {
                    if (headers[i].startsWith(PREFIX)) {
                        const u = new URL(headers[i]);
                        res.setHeader(i, "http://" + req.headers.host + u.pathname);
                    }
                    break;
                }
            }
        }
        setCors(res);
        for (let b of rs) {
            res.write(b);
        }
        res.end();
        r();
    })).catch((location) => {
        console.warn(location);
        if (res.writableEnded === false) {
            setCors(res);
            res.end();
        }
    });
}).listen(8014);

function setCors(res) {
    // res.setHeader("Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("allow", "POST, GET, OPTIONS, HEAD");
}