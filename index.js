//START

const { spawn } = require("child_process");
const http = require("http");
const logger = require("./log");
const { Port } = require('./config.json');

//CHECK FOR UPDATES
//COMMING SOON

/*
CHECK NODE VERSION
*/

const majorNodeVersion = parseInt(process.version.slice(1,process.version.indexOf('.')));
if (majorNodeVersion != 14) {
    logger.error("SenBot requires Node 14.x.x to run!");
    process.exit(0);
}

/*
UPTIMEROBOT TRICK FOR 24/7
*/

http.createServer(function (_req, res) {
    res.writeHead(200, "OK", { "Content-Type": "text/plain" });
    res.write("Thanks for using SenBot");
    res.end();
}).listen(Port || 8080);

logger.info("SenBot is starting...");


/*
CREATE A CHILD PROCESS AND HANDLE ERRORS
*/

function SenBot() {
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "sen.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", async (exitCode) => {
        if (exitCode == 0) return;
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.warn("SenBot is restarting...");
        SenBot();
    });

    child.on("error", function (error) {
        logger.error("An error occurred: " + JSON.stringify(error));
    });
};

SenBot();

//END