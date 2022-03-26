function error(data) {
	//red
	console.log("\x1b[31m", "[ ERROR ]", "\x1b[0m", data);
}

function warn(data) {
	//yellow
	console.log("\x1b[33m", "[  WARN  ]", "\x1b[0m", data);
}

function info(data) {
	//cyan
	console.log("\x1b[36m", "[ SENBOT ]", "\x1b[0m", data);
}

function loader(data) {
	//green
	console.log("\x1b[32m", "[ LOADER ]", "\x1b[0m", data);
}

function dev(data) {
	//purple
	console.log("\x1b[35m", "[  DEV  ]", "\x1b[0m", data);
}

function database(data) {
	//orange
	console.log("\x1b[34m", "[ DATABASE ]", "\x1b[0m", data);
}

module.exports = {
	error,
	warn,
	info,
	loader,
	dev,
	database
}