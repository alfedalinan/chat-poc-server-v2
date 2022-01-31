import { LoginController } from '../controllers/LoginController';
import { UserController } from '../controllers/UserController';
import { UserContactController } from '../controllers/UserContactController';
import { ConversationController } from '../controllers/ConversationController';
import { MessageController } from '../controllers/MessageController';
import { VerifyAccessToken, VerifyRefreshToken } from "../middlewares/Tokens";
import { refreshToken } from "../utilities/TokenHelper";

import { IUser } from "../interfaces/IUser";
import { UserRepository } from "../repositories/UserRepository";

class Routes {

    loginController: LoginController;
    userController: UserController;
    userContactController: UserContactController;
    conversationController: ConversationController;
    messageController: MessageController;

    constructor() {
        this.loginController = new LoginController();
        this.userController = new UserController();
        this.userContactController = new UserContactController();
        this.conversationController = new ConversationController();
        this.messageController = new MessageController();
     }

    public routes(app) : void {

        app.route('/login')
            .post(this.loginController.exec)
        
        app.route('/user')
            .get([VerifyAccessToken], this.userController.get)
            .post(this.userController.create)
        
        app.route('/user/:id')
            .get([VerifyAccessToken], this.userController.getByField)
            .put([VerifyAccessToken], this.userController.update)
        
        app.route('/user_contact')
            .post([VerifyAccessToken], this.userContactController.create)
        
        app.route('/user_contact/:id')
            .get([VerifyAccessToken], this.userContactController.getMyContacts)
            .put([VerifyAccessToken], this.userContactController.update)
            .delete([VerifyAccessToken], this.userContactController.remove)
        
        app.route('/user_contact/:id/:contact_id')
            .get([VerifyAccessToken], this.userContactController.getSingleDetail)
            
        app.route('/conversation')
            .get([VerifyAccessToken], this.conversationController.get)
            .post([VerifyAccessToken], this.conversationController.create)
        
        app.route('/conversation/:conversationId')
            .get( this.conversationController.getById)
            .delete([VerifyAccessToken], this.conversationController.remove)

        app.route('/message/:conversation_id')
            .get([VerifyAccessToken], this.messageController.get)
        
        app.route('/login/purge')
            .post([VerifyAccessToken], this.loginController.purge)
        
        app.route('/refresh_token')
            .post([VerifyRefreshToken], refreshToken)
    }
    
}

export { Routes }