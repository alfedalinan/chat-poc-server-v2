import { Server } from '../config/App';
import { Request, Response } from 'express';
import { listConversation, createConversation, getConversationById, removeConversation } from '../factories/ConversationFactory';
import { countUnreadMessagesPerId } from '../factories/MessageFactory';

class ConversationController {

    constructor() { }

    public get(request: Request, response: Response): any {

        let userId: number = parseInt(request.query.id.toString());

        listConversation(userId)
            .then(async (result) => {
                
                let conversationIds: Array<number> = [];

                for (let i = 0; i < result.length; i++) {
                    result[i]['deleted'] = false;
                    
                    conversationIds.push(result[i].conversation_id);
                }
                
                let convIds = conversationIds.length > 0 ? conversationIds.join(',') : "0";
                
                await countUnreadMessagesPerId( convIds, userId)
                    .then((res) => {

                        if (res.length > 0) {
                            result.forEach((element, index) => {

                                if (typeof res[index] != "undefined" &&
                                    element.conversation_id == res[index].conversation_id
                                ) {
                                    element['unread_messages'] = res[index].unread_messages;
                                }
                                else {
                                    element['unread_messages'] = 0;
                                }
    
                            });
                        }
                        else {
                            result.forEach((element, index) => {
                                element.unread_messages = 0;
                            });
                        }

                    })
                    .catch()

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
            });

    }

    public getById(request: Request, response: Response): any {

        let param: number | string[];

        if (request.params.conversationId.includes(',')) {
            param = request.params.conversationId.split(',');
        }
        else {
            param = parseInt(request.params.conversationId);
        }

        getConversationById(param)
            .then((result) => {
                
                if (result.length > 0) {
                    
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
        createConversation(request.body)
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
        removeConversation( parseInt(request.params.conversationId) )
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