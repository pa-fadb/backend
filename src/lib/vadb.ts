import { existsSync, mkdirSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import Logger from "./util/logger";
import { join } from "path";



class VADB {
    static app: express.Express;

    constructor() {
        VADB.#ensureLogsDirectoryExists();
        Logger.WriteFileInstance(Logger.GetCurrentFileName());

        VADB.app = express();

        VADB.#setup(VADB.app);
    }

    Start(port) {
        VADB.app.listen(port, () => {
            Logger.Info(`App listening on ${port}`);
        });
    }


    static #setup(app: express.Express) {
        Logger.Log("Setting up server.");

        // MIDDLEWARE //
        Logger.Debug("Setting up middlewares.");
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cookieParser());
        app.use(cors());
        app.use(multer({
            limits: {
                fileSize: 10 * 1024 ** 2 // 10 mb
            }
        }).any());

        // CUSTOM MIDDLEWARES //
        Logger.Debug("Setting up custom middlewares.");
        // rate limit
        app.use("*", require("./middlewares/OverrideMiddleware"));

        // LOADERS //
        Logger.Debug("Kick starting loaders");
        require("./middlewares/RouterMiddleware")(app, join(__dirname, "../", "routers"));
        require("./middlewares/GraphQLMiddleware")(app, join(__dirname, "../", "graphql"));

        // SETTINGS //
        app.set("json-spaces", 4);
        app.disable("x-powered-by")

        Logger.Log("Setup complete!")
    }

    static #ensureLogsDirectoryExists() {
        let logs = Logger.GetLogsDirectory();

        if (!existsSync(logs))
            mkdirSync(logs);
    }
}

export default VADB;