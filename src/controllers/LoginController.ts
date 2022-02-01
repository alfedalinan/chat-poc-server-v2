import { Request, Response } from 'express';
import { Server } from '../config/App';
import { decryptText } from "../utilities/BaseHelper";
import { createToken } from "../utilities/TokenHelper";
import { ILoginRepository } from "../interfaces/ILoginRepository";
import { LoginRepository } from "../repositories/LoginRepository";

let loginRepository: ILoginRepository;

class LoginController {

    constructor() { 
        loginRepository = new LoginRepository();
    }

    public exec(request: Request, response: Response): any {
        
        loginRepository.login(request.body.username)
            .then((result) => {
                
                if (result != null) {
                    
                    // check if password is correct here
                    let requestPassword = decryptText(request.body.password);
                    let resultPassword = decryptText(result.password);
                    if (requestPassword == resultPassword) {
                        
                        let payload: Object = { 
                            username: result.username, 
                            id: result.id, 
                            register_id: result.registerId, 
                            first_name: result.firstName, 
                            last_name: result.lastName, 
                            email: result.email 
                        };
                        
                        let tokenPayload = {
                            id: result.id,
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
                            data: (result != null) ? payload : {}
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
            loginRepository.removeRegisters(false);
        }
        else {
            loginRepository.removeRegisters(true, request.body.register_id);
        }

    }
}

export { LoginController }