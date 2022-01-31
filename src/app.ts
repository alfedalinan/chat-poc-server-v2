import * as express from 'express'
import { Routes } from "./routes/Routes";
import bodyParser = require("body-parser");
import * as helmet from 'helmet';
import * as cors from 'cors';

class App {

    public app: express.Application;
    public routeProvisions: Routes;

    constructor() { 
        this.app = express();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));

        // cors and helmet
        this.app.use(cors());
        this.app.use(helmet());

        this.routeProvisions = new Routes();
        this.routeProvisions.routes(this.app);
    }

}

export default new App().app;
