import { Server } from '../config/App';
import { Request, Response } from 'express';
import { countUnreadMessagesPerId } from '../factories/MessageFactory';
import { IConversationRepository } from "../interfaces/IConversationRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { mapKeys, rearg, snakeCase } from 'lodash';
import { ConversationBody } from '../data-sets/ConversationBody';


let conversationRepository: IConversationRepository;

class ConversationController {

    constructor() { 
        conversationRepository = new ConversationRepository();
    }

    public get(request: Request, response: Response): any {

        let memberId: number = parseInt(request.query.id.toString());

        // listConversation(userId)
        conversationRepository.getConversations(memberId)
            .then(async (result) => {
                
                let conversationIds: Array<number> = [];

                for (let i = 0; i < result.length; i++) {
                    result[i].deleted = false;
                    
                    conversationIds.push(result[i].conversationId);
                }
                
                let convIds = conversationIds.length > 0 ? conversationIds.join(',') : "0";
                
                await countUnreadMessagesPerId( convIds, memberId)
                    .then((res) => {

                        if (res.length > 0) {
                            result.forEach((element, index) => {

                                if (typeof res[index] != "undefined" && element.conversationId == res[index].conversation_id) {
                                    element.unreadMessages = res[index].unread_messages;
                                }
                                else {
                                    element.unreadMessages = 0;
                                }
    
                            });
                        }
                        else {
                            result.forEach((element, index) => {
                                element.unreadMessages = 0;
                            });
                        }

                    })
                    .catch();
                
                let data: any = [];
                result.forEach(item => {
                    let snakeCaseConverted: any = mapKeys(item, rearg(snakeCase, 1));
                    data.push(snakeCaseConverted);
                });

                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: data
                });
            })
            .catch((error) => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });
            });

    }

    public getById(request: Request, response: Response): any {

        let conversationId: number = null;
        let memberId: number = null;

        if (request.params.conversationId.includes(',')) {
            conversationId = parseInt(request.params.conversationId.split(',')[0]);
            memberId = parseInt(request.params.conversationId.split(',')[1]);
        }
        else {
            conversationId = parseInt(request.params.conversationId);
            memberId = null;
        }

        conversationRepository.getConversationById(conversationId, memberId)
            .then((result) => {
                
                if (result.length > 0) {
                    
                    let data: any = []
                    result.forEach(item => {
                        let snakeCaseConverted: any = mapKeys(item, rearg(snakeCase, 1));
                        data.push(snakeCaseConverted);
                    });

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
                        data: {}
                    });

                }

            })
            .catch((error) => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });

            });


    }

    public create(request: Request, response: Response): any {
        // name, members
        let conversationBody: ConversationBody = request.body;

        // createConversation(conversationBody)
        conversationRepository.createConversation(conversationBody)
            .then((result) => {
                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        conversation_id: result.conversation_id,
                        users: result.users
                    }
                });
            })
            .catch((error) => {
                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });
            });

    }

    public remove(request: Request, response: Response): any {
        // conversationId

        let conversationId: number = parseInt(request.params.conversationId);

        conversationRepository.removeConversation(conversationId)
            .then((result) => {
                
                response.json({
                    status: Server.status.OK.CODE,
                    message: Server.status.OK.MSG,
                    data: {
                        msg: "Conversation has been deleted successfully"
                    }
                });

            })
            .catch((error) => {

                response.json({
                    status: Server.status.INTERNAL_SERVER_ERROR.CODE,
                    message: Server.status.INTERNAL_SERVER_ERROR.MSG,
                    data: error
                });

            })

    }

}

export { ConversationController }