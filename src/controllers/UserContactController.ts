import { Request, Response } from 'express';
import { error } from 'node:console';
import { Server } from '../config/App';
import { getAllContacts, createNewContact, getSingleContactDetail, updateContactDetails, removeContact } from '../factories/UserContactFactory';
import { getUserByField } from "../factories/UserFactory";


class UserContactController {

    constructor() { }

    public getMyContacts(request: Request, response: Response): any {

        getAllContacts( parseInt(request.params.id) )
            .then((result) => {

                if (result.length > 0) {

                    response.json({
                        status: Server.status.OK.CODE,
                        message: Server.status.OK.MSG,
                        data: result
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

        getSingleContactDetail( parseInt(request.params.contact_id), parseInt(request.params.id) )
            .then(result => {

                if (result.length > 0) {

                    response.json({
                        status: Server.status.OK.CODE,
                        message: Server.status.OK.MSG,
                        data: result[0]
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

        let contactEmail = "";
        let contactRegId = "";
        let contactUsername = "";

        await getUserByField('id', request.body.contact_id)
            .then(result => {

                if (result.length > 0) {
                    contactEmail = result[0].email;
                    contactRegId = result[0].register_id;
                    contactUsername = result[0].username;
                }

            })
        
        let body = {};    

        createNewContact(request.body)
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

        updateContactDetails(request.body, parseInt(request.params.id))
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

        removeContact( parseInt(request.params.id) )
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