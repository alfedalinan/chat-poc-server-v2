import { Request, Response } from 'express';
import { findUser, removeRegister } from '../factories/LoginFactory';
import { Server } from '../config/App';
import { decryptText } from "../utilities/BaseHelper";
import { createToken } from "../utilities/TokenHelper";
import { create } from 'ts-node';

class LoginController {

    constructor() { }

    public exec(request: Request, response: Response): any {
        
        findUser({ username: request.body.username })
            .then((result) => {
                
                if (result.length > 0) {
                    
                    // check if password is correct here
                    let requestPassword = decryptText(request.body.password);
                    let resultPassword = decryptText(result[0].password);
                    if (requestPassword == resultPassword) {
                        
                        let payload: Object = { 
                            username: result[0].username, 
                            id: result[0].id, 
                            register_id: result[0].register_id, 
                            first_name: result[0].first_name, 
                            last_name: result[0].last_name, 
                            email: result[0].email 
                        };
                        
                        let tokenPayload = {
                            id: result[0].id,
                            marked: Math.ceil(Date.now() / 1000)
                        };
                        // create two tokens (access and refresh)
                        let accessToken = createToken(tokenPayload, 'access');
                        let refreshToken = createToken(tokenPayload, 'refresh');

                        payload['access_token'] = accessToken;
                        payload['refresh_token'] = refreshToken;

                        response.json({
                            status: Server.status.OK.CODE,
                            message: Server.status.OK.MSG,
                            data: (result.length > 0) ? payload : {}
                        });

                    }
                    else {
                        // Incorrect password
                        response.json({
                            status: Server.status.UNAUTHORIZED.CODE,
                            message: Server.status.UNAUTHORIZED.MSG,
                            data: {
                                msg: "The password you have entered is incorrect"
                            }
                        });

                    }

                }
                else {

                    response.json({
                        status: Server.status.NOT_FOUND.CODE,
                        message: Server.status.NOT_FOUND.MSG,
                        data: {
                            msg: "User was not found in our record"
                        }
                    });

                }

            })
            .catch((error) => {

                response.status(Server.status.INTERNAL_SERVER_ERROR.CODE).json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });

            });

    }

    public purge(request: Request, response: Response): any {
        
        if (request.body.register_id == null || request.body.register_id == '') {
            removeRegister(false);
        }
        else {
            removeRegister(true, request.body.register_id);
        }

    }
}

export { LoginController }