import { Request, Response } from 'express';
import { Server } from '../config/App';
import { IUserRepository } from "../interfaces/IUserRepository";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { mapKeys, rearg, snakeCase } from 'lodash';

let userRepository: IUserRepository;

class UserController {


    constructor() { 
        userRepository = new UserRepository();
    }

    public get(request: Request, response: Response): any {

        let username: string = request.query.value.toString();

        userRepository.searchUsers(username)
            .then((result) => {
                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: result
                });
            })
            .catch((error) => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });
                
                return;
            });

    }

    public getByField(request: Request, response: Response): any {
        
        userRepository.getUserById(parseInt(request.params.id))
            .then(result => {

                if (result != null) {

                    let data: any = mapKeys(result, rearg(snakeCase, 1));

                    response.json({
                        status: Server.status.OK.CODE,
                        message: Server.status.OK.MSG,
                        data: data
                    });
                }
                else {
                    response.json({
                        status: Server.status.NOT_FOUND.CODE,
                        message: Server.status.NOT_FOUND.MSG,
                        data: {
                            msg: "User was not found"
                        }
                    });
                }

            })
            .catch(error => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });

            })

    }

    public create(request: Request, response: Response): any {

        let user: User = request.body;

        // createNewUer(request.body)
        userRepository.createUser(user)
            .then((result) => {
                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        insertId: result,
                        msg: "Your account has been created successfully",
                    }
                });
            })
            .catch((error) => {
                if (error.code == "ER_DUP_ENTRY" || error.errno == 1062) {

                    let messageArray: Array<string> = error.sqlMessage.split(" ");
                    let lastIndex: number = messageArray.length - 1;
                    let column: any = messageArray[lastIndex].replace("'", "").replace("'", "");

                    response.json({
                        status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                        message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                        data: {
                            msg: `${column.charAt(0).toUpperCase()}${column.slice(1)} '${request.body[column]}' has been already taken.`
                        }
                    });
                }
                else {
                    response.json({
                        status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                        message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                        data: error
                    });
                }
                
                return;
            });

    }

    public update(request: Request, response: Response): any {

        // updateUser(request.body, { id: request.params.id })
        let user: User = request.body;
        let id: number = parseInt(request.params.id);

        userRepository.updateUser(id, user)
            .then(result => {
                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        msg: "Your account has been updated successfully",
                        params: request.body
                    }
                });
            })
            .catch(error => {

                if (error.code == "ER_DUP_ENTRY" || error.errno == 1062) {

                    let messageArray: Array<string> = error.sqlMessage.split(" ");
                    let lastIndex: number = messageArray.length - 1;
                    let column: any = messageArray[lastIndex].replace("'", "").replace("'", "");

                    response.json({
                        status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                        message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                        data: {
                            msg: `${column.charAt(0).toUpperCase()}${column.slice(1)} '${request.body[column]}' has been already taken.`
                        }
                    });
                }
                else {
                    response.json({
                        status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                        message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                        data: error
                    });
                }

                return;
            });

    }

} export { UserController }