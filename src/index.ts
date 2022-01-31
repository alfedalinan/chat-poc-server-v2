import app from './app';
import { Server, Project, Database } from './config/App';
import { createConnection } from 'mysql';
import { checkRegister, registerUser, unregisterUser, updateUserRegister } from './factories/UserFactory';
import { getUnreadConversation, setMessageStatusByUuid, createMessage, getMessageStatusByIds, setMessageStatus, setReadStatus } from './factories/MessageFactory';
import { getCurrentTS } from "./utilities/BaseHelper";
import { createConversation } from './factories/ConversationFactory';

const SocketIO = require('socket.io');

global['dbConnection'] = createConnection(Database.local);

let server = app.listen(Server.port, () => {
    console.info(`${Project.name} ${Project.version} is listening to port ${Server.port}`);
    console.info(`You can now access this project at ${Server.url}:${Server.port}`);
});

let io = SocketIO(server, {
    cors: {
        origin: '*'
    }
});

let sessions: Object = new Object();

io.on('connection', (socket) => {
    // A: REGISTER
    /**
     * data: userId, username, register_id
     */
    socket.on('user.register:send', async (data) => {

        let registeredUser = [];
        await checkRegister({ user_id: data.userId })
            .then((result) => {
                registeredUser = result;
            })
            .catch()
        
        if (registeredUser.length < 1) {
            // user is from offline status
            registerUser({ user_id: data.userId, register_id: data.register_id })
        }
        else {
            updateUserRegister([data.register_id, parseInt(data.userId)])
        }

        
        let unreadItems = {
            delivered_user_id: data.userId,
            delivered_register_id: data.register_id,
            conversations: [],
            message_ids: [],
            message_uuids: []
        }

        await getUnreadConversation({ to_member: data.userId })
            .then((result) => {
                
                for (let i = 0; i < result.length; i++) {
                    unreadItems.conversations.push(result[i].conversation_id);
                    unreadItems.message_ids.push(result[i].id);
                }

            })
            .catch()
        
        // Remove duplicates from conversation IDs
        unreadItems.conversations = unreadItems.conversations.filter((item, pos) => {
            return unreadItems.conversations.indexOf(item)== pos; 
        });

        // Set undelivered messages to delivered
        if (unreadItems.message_ids.length > 0) {

            await getMessageStatusByIds(unreadItems.message_ids.join(','), 0)
            .then((result) => {
                for (let i = 0; i < result.length; i++) {
                    unreadItems.message_uuids.push(result[i].uuid);
                }
            })
            .catch()

            setMessageStatus(unreadItems.message_ids.join(','), 1)
                .then()
                .catch()
        }
        
        // Save the user to sessions
        sessions[data.register_id] = socket.id;
        data['session_id'] = sessions[data.register_id];
        
        io.emit('message.broadcast:delivered', unreadItems);
        io.emit('user.register:ack', data);
    });

    // B: UNREGISTER
    /**
     * data: userId, username, register_id
     */
    socket.on('user.unregister:send', (data) => {

        // remove record of register
        unregisterUser({ user_id: data.userId })
            .then((result) => {
                delete sessions[data.register_id];
                io.emit('user.unregister:ack', data);
            })
            .catch()

    });

    // C: MESSAGE SENDING - SENDER
    /**
     * data: msg_uuid, 
            conversation_id, 
            text, 
            sender_user_id, 
            receiver_user_id,
            sender_register_id,
            receiver_register_id
     */
    socket.on('message.send:send', async (data) => {
        let currentTs = getCurrentTS();
        let messageData = { 
            uuid: data.msg_uuid, 
            conversation_id: data.conversation_id, 
            text: data.text, 
            from_member: data.sender_user_id, 
            to_member: data.receiver_user_id,
            created_at: currentTs.timestamp
        };

        await createMessage(messageData)
        .then((result) => {
            
            // emit back to sender for acknowledgement
            io.to(sessions[data.sender_register_id]).emit('message.send:ack', {
                msg_id: result.insertId,
                msg_uuid: data.msg_uuid,
                conversation_id: data.conversation_id,
                sender_user_id: data.sender_user_id,
                receiver_user_id: data.receiver_user_id,
                sender_register_id: data.sender_register_id,
                receiver_register_id: data.receiver_register_id,
                text: data.text,
                created_at: messageData.created_at,
                updated_at: null,
                status: 0,
                additional: data.hasOwnProperty('sender_username') ? {
                    sender_first_name: data.sender_first_name,
                    sender_last_name: data.sender_last_name,
                    sender_username: data.sender_username,
                    sender_email: data.sender_email,
                } : {}
            });

            // socket.broadcast.to(sessions[data.sender_register_id]).emit('message.send:ack', {
            //     msg_id: result.insertId,
            //     msg_uuid: data.msg_uuid,
            //     conversation_id: data.conversation_id,
            //     sender_user_id: data.sender_user_id,
            //     receiver_user_id: data.receiver_user_id,
            //     sender_register_id: data.sender_register_id,
            //     receiver_register_id: data.receiver_register_id,
            //     text: data.text
            // });
            socket.broadcast.to(sessions[data.receiver_register_id]).emit('message.receive:send', {
                msg_id: result.insertId,
                msg_uuid: data.msg_uuid,
                text: data.text,
                conversation_id: data.conversation_id,
                sender_user_id: data.sender_user_id,
                receiver_user_id: data.receiver_user_id,
                sender_register_id: data.sender_register_id,
                receiver_register_id: data.receiver_register_id,
                created_at: messageData.created_at,
                updated_at: null,
                status: 0,
                additional: data.hasOwnProperty('sender_username') ? {
                    receiver_first_name: data.sender_first_name,
                    receiver_last_name: data.sender_last_name,
                    receiver_username: data.sender_username,
                    receiver_email: data.sender_email,
                } : {}
            });

        })
        .catch()
        
    });


    // C.8: MESSAGE RECEIVE ACKNOWLEDGEMENT
    /**
     * data: text, uuid, conversation_id, from_member, to_member, sender_register_id, receiver_register_id
     */
    // socket.on('message.receive:ack', (data) => {});


    // D: MESSAGE STATUS DELIVERED  - RECEIVER
    /**
     * data: text, msg_uuid, conversation_id, sender_register_id, receiver_register_id, sender_user_id, receiver_user_id
     */
    socket.on('message.status.delivered:send', (data) => {
        setMessageStatusByUuid(data.msg_uuid, 1)
            .then((result) => {

                socket.broadcast.to(sessions[data.sender_register_id]).emit('message.status.delivered:ack', {
                    text: data.text,
                    msg_uuid: data.msg_uuid,
                    conversation_id: data.conversation_id,
                    sender_register_id: data.sender_register_id,
                    receiver_register_id: data.receiver_register_id
                });

            })
            .catch()

    });

    // E: MESSAGE STATUS READ - RECEIVER
    /**
     * data: text, msg_uuid, conversation_id, sender_register_id, receiver_register_id, sender_user_id, receiver_user_id
     */
    socket.on('message.status.read:send', (data) => {

        if (data.hasOwnProperty('msg_uuids')) {
            // Multiple messages read
            // ** msg_uuids, sender_register_id

            if (data.msg_uuids.length > 0) {
                var msg_uuids = data.msg_uuids.join("','");
                setMessageStatusByUuid(msg_uuids, 2)
                    .then((result) => {
                        socket.broadcast.to(sessions[data.sender_register_id]).emit('message.status.read:ack', {
                            msg_uuids: data.msg_uuids,
                            sender_register_id: data.sender_register_id
                        });
                    })
                    .catch()
            }

        }
        else {
            // Single message read
            setReadStatus(data.receiver_user_id, data.conversation_id)
            .then((result) => {

                socket.broadcast.to(sessions[data.sender_register_id]).emit('message.status.read:ack', {
                    text: data.text,
                    msg_uuid: data.msg_uuid,
                    conversation_id: data.conversation_id,
                    sender_register_id: data.sender_register_id,
                    receiver_register_id: data.receiver_register_id
                });

            })
            .catch()
        }

    });


    // F: MESSAGE TYPING - SENDER
    socket.on('message.typing:send', (data) => {
        socket.broadcast.to(sessions[data.receiver_register_id]).emit('message.typing:receive', data);
    });


    // G: CREATING CONVERSATION
    /**
     * data: name, sernder_username, receiver_username, sender_user_id, sender_register_id, receiver_sender_id, receiver_register_id, text, msg_uuid
     */
    socket.on('conversation.create:send', async (data) => {

        let conversationId: number = 0;
        let memberIds: Array<number> = [];

        memberIds.push(data.sender_user_id);
        memberIds.push(data.receiver_user_id);

        // 1. Create the conversation and members
        await createConversation({ name: data.name, members: memberIds })
            .then((result) => {
                conversationId = result.conversation_id;
            })
            .catch()
        
        // 2. Add the message
        createMessage({ 
            uuid: data.msg_uuid, 
            conversation_id: conversationId, 
            text: data.text, 
            from_member: data.sender_user_id, 
            to_member: data.receiver_user_id
        })
            .then((result) => {

                io.to(sessions[data.sender_register_id]).emit('message.send:ack', {
                    msg_id: result.insertId,
                    msg_uuid: data.msg_uuid,
                    conversation_id: conversationId,
                    sender_user_id: data.sender_user_id,
                    receiver_user_id: data.receiver_user_id,
                    sender_register_id: data.sender_register_id,
                    receiver_register_id: data.receiver_register_id,
                    text: data.text,
                    sender_username: data.sender_username,
                    receiver_username: data.receiver_username
                });

                // socket.broadcast.to(sessions[data.sender_register_id]).emit('message.send:ack', {
                //     msg_id: result.insertId,
                //     msg_uuid: data.msg_uuid,
                //     conversation_id: conversationId,
                //     sender_user_id: data.sender_user_id,
                //     receiver_user_id: data.receiver_user_id,
                //     sender_register_id: data.sender_register_id,
                //     receiver_register_id: data.receiver_register_id,
                //     text: data.text,
                //     sender_username: data.sender_username,
                //     receiver_username: data.receiver_username
                // });
    
                socket.broadcast.to(sessions[data.receiver_register_id]).emit('message.receive:send', {
                    msg_id: result.insertId,
                    msg_uuid: data.msg_uuid,
                    text: data.text,
                    conversation_id: conversationId,
                    sender_user_id: data.sender_user_id,
                    receiver_user_id: data.receiver_user_id,
                    sender_register_id: data.sender_register_id,
                    receiver_register_id: data.receiver_register_id,
                    sender_username: data.sender_username,
                    receiver_username: data.receiver_username
                });

            })
            .catch()
        
    });

    // ADDITIONAL: SET READ STATUS
    /**
     * data: user_id, conversation_id
     */
    socket.on('message.status.read:set', (data) => {
        setReadStatus(data.user_id, data.conversation_id)
            .then(result => {

            })
            .catch();
    });
});