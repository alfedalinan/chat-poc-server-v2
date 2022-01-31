import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Constants, Server } from "../config/App";

export const VerifyAccessToken = (request: Request, response: Response, next: NextFunction) => {
    const token = <string>request.headers.authorization;
    let payload: any;

    try {
        payload = <any>jwt.verify(token, Constants.JWT_ACCESS_SECRET);
        next();

    } catch (error) {
        
        response.json({
            status: Server.status.PRECONDITION_FAILED.CODE,
            message: Server.status.PRECONDITION_FAILED.MSG,
            data: {
                msg: "Invalid or no token submitted"
            }
        });

        return;
    }
};

export const VerifyRefreshToken = (request: Request, response: Response, next: NextFunction) => {

    const token = <string>request.headers.authorization;
    let payload: any;

    try {
        payload = <any>jwt.verify(token, Constants.JWT_REFRESH_SECRET);
        next();

    } catch (error) {
        
        response.json({
            status: Server.status.PRECONDITION_REQUIRED.CODE,
            message: Server.status.PRECONDITION_REQUIRED.MSG,
            data: {
                msg: "Invalid or no refresh token submitted"
            }
        });

        return;
    }

};