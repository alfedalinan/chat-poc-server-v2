import { request } from 'express';
import { mysqlToPromise, mysqlParameterizedPromise } from '../utilities/DbHelper';

export const listConversation = async (id: number) : Promise<any> => {
    let conversationIds: number[] = [];

    await mysqlToPromise(`SELECT conversations.id FROM conversations JOIN conversation_members on conversations.id = conversation_members.conversation_id WHERE member_id = ${id};`)
        .then((result) => {
            for (var i = 0; i < result.length; i++) {
                conversationIds.push(result[i].id);
            }
        })
        .catch((error) => {

        });

    let convIdsString: String = conversationIds.length > 0 ? conversationIds.join(',') : '0';
    
    // return mysqlToPromise(`SELECT users.id, users.username, conversation_members.conversation_id, user_registers.register_id FROM users JOIN conversation_members ON users.id = conversation_members.member_id LEFT JOIN user_registers on conversation_members.member_id = user_registers.user_id WHERE conversation_id IN (${convIdsString}) AND member_id != ${id};`);
    
    return mysqlToPromise(`SELECT users.id, users.username, users.first_name, users.last_name, conversation_members.conversation_id, user_registers.register_id FROM users JOIN conversation_members ON users.id = conversation_members.member_id LEFT JOIN user_registers on conversation_members.member_id = user_registers.user_id  WHERE conversation_members.conversation_id IN (${convIdsString}) AND member_id != ${id} GROUP BY conversation_id`);
};

export const createConversation = async (data: Object) : Promise<any> => {

    let conversationId: number = 0;
    let userResults: any = [];
    let convInsertResult: any = [];

    await mysqlParameterizedPromise(`INSERT INTO conversations SET ?`, { name: data['name'] })
        .then((response) => {
            conversationId = response.insertId;
        })
        .catch((error) => {});
    await mysqlToPromise(`SELECT users.id, users.first_name, users.last_name, users.email, users.username, user_registers.register_id FROM users LEFT JOIN user_registers ON users.id = user_registers.user_id WHERE users.id IN (${data['members'].join(',')})`)
        .then(result => {
            userResults = result;
        })
        .catch();
    
    let values: Array<any> = new Array();

    for (let i = 0; i < data['members'].length; i++) {
        
        values.push([ conversationId, data['members'][i] ]);
        
    }

    await mysqlParameterizedPromise(`INSERT INTO conversation_members(conversation_id, member_id) VALUES ?`, [values])
        .then(result => {
            convInsertResult = result;
        }).catch();

    return {
        rows: convInsertResult,
        users: userResults,
        conversation_id: conversationId
    }

};

export const getConversationById = (param: number | string[]): Promise<any> => {
    
    let queryString: string = ``;


    if (typeof param == "object") {

        queryString = `SELECT conversation_members.conversation_id, conversation_members.member_id, users.first_name, users.last_name, users.email, user_registers.register_id FROM conversations JOIN conversation_members ON conversations.id = conversation_members.conversation_id LEFT JOIN user_registers ON conversation_members.member_id = user_registers.user_id LEFT JOIN users ON conversation_members.member_id = users.id WHERE conversations.id = ${param[0]} AND conversation_members.member_id = ${param[1]}`;

    }
    else {
        
        queryString = `SELECT conversation_members.conversation_id, conversations.name, conversation_members.member_id FROM conversations JOIN conversation_members ON conversations.id = conversation_members.conversation_id WHERE conversations.id = ${param}`;

    }

    return mysqlToPromise(queryString);

}

export const removeConversation = (conversationId: number) : Promise<any> => {

    mysqlToPromise(`DELETE FROM messages WHERE conversation_id=${conversationId}`);
    mysqlToPromise(`DELETE FROM conversation_members WHERE conversation_id=${conversationId}`);

    return mysqlToPromise(`DELETE FROM conversations WHERE id=${conversationId}`);
};