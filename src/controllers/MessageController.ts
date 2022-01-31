import { Request, Response } from 'express';
import { Server } from '../config/App';
import { getMessagesByConversation } from '../factories/MessageFactory';

class MessageController {

    constructor() { }

    public get(request: Request, response: Response): any {
        getMessagesByConversation([request.params.conversation_id])
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
}

export { MessageController }