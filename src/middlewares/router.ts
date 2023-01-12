import Express from "express";
import CreateRouters from "../old_code/routing/createRouters";

import Logger from "../old_code/lib/logger";



export default function routerMidware(app: Express.Express) {
    let routerInfos = CreateRouters();
    for (const routerInfo of routerInfos) {
        let routerNames = routerInfo.getNames();
        for (const routerPath of routerNames) {
            app.use(routerPath, routerInfo.router)
        }

        Logger.Debug(
            `Registered router: ${routerInfo.baseSitePath} ` +
            `${
                routerInfo.aliases.length > 0
                    ? `With ${routerInfo.aliases.length} aliases: (${routerInfo.aliases.join(", ")})`
                    : ""
            }`
        );
    };
};
