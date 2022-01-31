import * as jwt from "jsonwebtoken";
import { Constants, Server } from "../config/App";
import { Request, Response } from "express";

export const createToken = (payload: any, type: string) =>  {
    
    let secret = type == 'access' ? Constants.JWT_ACCESS_SECRET : Constants.JWT_REFRESH_SECRET;
    let expiry = type == 'access' ? Constants.ACCESS_TOKEN_EXPIRY : Constants.REFRESH_TOKEN_EXPIRY;

    try {
        
        let jwToken = jwt.sign(payload, secret, { expiresIn: expiry });

        return jwToken;

    } catch (error) {
        return error;
    }
};

export const refreshToken = (request: Request, response: Response) => {

    try {
        
        let refreshToken = createToken(request.body.payload, 'refresh');
        let accessToken = createToken(request.body.payload, 'access');

        response.json({
            status: Server.status.OK.CODE,
            message: Server.status.OK.MSG,
            data: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        });

    } catch (error) {
        
        response.json({
            status: Server.status.BAD_REQUEST.CODE,
            message: Server.status.BAD_REQUEST.MSG,
            data: {
                msg: "Something went wrong on token renewal"
            }
        });

    }
};