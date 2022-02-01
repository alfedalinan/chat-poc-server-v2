import { Request, Response } from "express";
import { Server } from "../config/App";
import { IUserContactRepository } from "../interfaces/IUserContactRepository";
import { UserContactRepository } from "../repositories/UserContactRepository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { UserContact } from "../entities/UserContact";
import { mapKeys, rearg, snakeCase } from "lodash";

let userContactRepository: IUserContactRepository;
let userRepository: IUserRepository;

class UserContactController {

    constructor() { 
        userContactRepository = new UserContactRepository();
        userRepository = new UserRepository();
    }

    public getMyContacts(request: Request, response: Response): any {

        let id: number = parseInt(request.params.id);

        // getAllContacts( parseInt(request.params.id) )
        userContactRepository.getContacts(id)
             .then((result) => {

                if (result.length > 0) {

                    let data: any = [];
                    result.forEach(item => {
                        let snakeCaseConverted: any = mapKeys(item, rearg(snakeCase, 1));
                        data.push(snakeCaseConverted);
                    })

                    response.json({
                        status: Server.status.OK.CODE,
                        message: Server.status.OK.MSG,
                        data: data
                    })
                }
                else {
                    response.json({
                        status: Server.status.NOT_FOUND.CODE,
                        message: Server.status.NOT_FOUND.MSG,
                        data: result
                    })
                }

            })
            .catch((error) => {
                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                })

                return;
            })

    }

    public getSingleDetail(request: Request, response: Response): any {

        let contactId: number = parseInt(request.params.contact_id);
        let ownerId: number = parseInt(request.params.id);

        // getSingleContactDetail( parseInt(request.params.contact_id), parseInt(request.params.id) )
        userContactRepository.getSingleContact(contactId, ownerId)
            .then(result => {

                if (result != null) {

                    response.json({
                        status: Server.status.OK.CODE,
                        message: Server.status.OK.MSG,
                        data: result
                    });

                }
                else {
                    response.json({
                        status: Server.status.NOT_FOUND.CODE,
                        message: Server.status.NOT_FOUND.MSG,
                        data: result
                    });
                }

            }) 
            .catch(error => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });

            });

    }

    public async create(request: Request, response: Response): Promise<any> {

        let contactEmail: string = "";
        let contactRegId: string = "";
        let contactUsername: string = "";

        let contactId: number = parseInt(request.body.contact_id);

        await userRepository.getUserById(contactId)
            .then(result => {

                if (result != null) {
                    contactEmail = result.email;
                    contactUsername = result.username;
                }

            });
        
        let body = {};    
        let userContact: UserContact = request.body;

        userContactRepository.createContact(userContact)
            .then((result) => {

                body = request.body;
                body['email'] = contactEmail;
                body['register_id'] = contactRegId;
                body['username'] = contactUsername;

                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        insertId: result.insertId,
                        insertData: body,
                        msg: "A new contact has been added successfully"
                    }
                })
            })
            .catch((error) => {
                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                })

                return;
            })

    }

    public update(request: Request, response: Response): any {

        let id: number = parseInt(request.params.id);
        let userContact: UserContact = request.body;

        // updateContactDetails(request.body, parseInt(request.params.id))
        userContactRepository.updateContact(id, userContact)
            .then(result => {

                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        msg: "Contact details has been updated successfully",
                        id: request.params.id,
                        body: request.body
                    }
                })

            })
            .catch(error => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                })

            })
    }

    public remove(request: Request, response: Response): any {
        
        let id: number = parseInt(request.params.id);

        // removeContact( parseInt(request.params.id) )
        userContactRepository.removeContact(id)
            .then(result => {

                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        msg: "Contact has been removed successfully",
                        contactId: request.params.id
                    }
                });

            })
            .catch(error => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                })

            });


    }

} export { UserContactController }