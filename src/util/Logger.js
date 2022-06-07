const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const dateFormat = require("dateformat");

const Colours = {
    ERROR: "#FF0040",
    WARNING: "#FFC400",
    INFO: "#00FF7F",
    LOG: "#00AAFF",
    DEBUG: "#808080"
}

class Logger {
    constructor() {
        throw new Error("This class cannot be instantiated.");
    }

    static Error(message) {
        this.#logBackground(message, "ERROR", Colours.ERROR, "#FFF");
    }

    static Warn(message) {
        this.#logBackground(message, "WARNING", Colours.WARNING, "#000");
    }

    static Info(message) {
        this.#log(message, "INFO", Colours.INFO);
    }

    static Log(message) {
        this.#log(message, "LOG", Colours.LOG);
    }

    static Debug(message) {
        this.#log(message, "DEBUG", Colours.DEBUG);
    }

    static Empty() {
        console.log("");
    }

    static #log(message, verbosity, colour) {
        if (Config["log_level"].indexOf(verbosity.toLowerCase()) === -1)
            return;

        let fileType = this.#getCallerType();

        this.#logToFile(`[${dateFormat(Date.now(), "HH:MM:ss")}] [${fileType}] [${verbosity}]: ${message}`)
        console.log(`${chalk.hex(colour)("•")} [${dateFormat(Date.now(), "HH:MM:ss")}] [${fileType}] ${chalk.hex(colour)(chalk.bold(`[${verbosity}]`))}: ${message}`)
    }

    static #logBackground(message, verbosity, colour, textColour) {
        if (Config["log_level"].indexOf(verbosity.toLowerCase()) === -1)
            return;

        let fileType = this.#getCallerType();

        this.#logToFile(`[${dateFormat(Date.now(), "HH:MM:ss")}] [${fileType}] [${verbosity}]: ${message}`)
        console.log(`${chalk.hex(colour)("•")} [${dateFormat(Date.now(), "HH:MM:ss")}] [${fileType}] ${chalk.bgHex(colour)(chalk.hex(textColour)(chalk.bold(`[${verbosity}]`)))}: ${message}`)
    }

    static #logToFile(message) {
        let filePath = this.GetCurrentFileName();

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "");
            this.#writeFileHeader(filePath)
        }

        fs.appendFileSync(filePath, message + "\n");
    }

    static #writeFileHeader(filepath) {
        fs.appendFileSync(filepath, `--- ${Package.name} v${Package.version} ---\n`)
    }

    static WriteFileInstance(filepath) {
        if (!fs.existsSync(filepath))
            fs.writeFileSync(filepath, "");

        fs.appendFileSync(filepath, `--- ${Package.name} v${Package.version} ---\n`)
        fs.appendFileSync(filepath, `--- ${dateFormat(Date.now(), 'dddd, mmmm d, yyyy h:MM:ss TT Z')} ---\n`)
    }

    static GetLogsDirectory() {
        return path.join(__dirname, "../../", "logs");
    }

    static GetCurrentFileName() {
        return path.join(this.GetLogsDirectory(), dateFormat(Date.now(), "isoDate") + ".txt")
    }

    // Copied from https://github.com/stefanpenner/get-caller-file
    static #getCallerType(position = 3) {
        if (position >= Error.stackTraceLimit) {
            throw new TypeError('getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `' + position + '` and Error.stackTraceLimit was: `' + Error.stackTraceLimit + '`');
        }

        const oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack)  => stack;
        const stack = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;


        if (stack !== null && typeof stack === 'object') {
            // stack[0] holds this file
            // stack[1] holds where this function was called
            // stack[2] holds the file we're interested in
            return stack[position] ? (stack[position]).getTypeName() : undefined;
        }
    }
}

module.exports = Logger;