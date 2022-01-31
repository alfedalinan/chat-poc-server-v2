import { mysqlToPromise, mysqlParameterizedPromise } from '../utilities/DbHelper';

export const getMessagesByConversation = (data) : Promise<any> => {
    return mysqlParameterizedPromise(`SELECT messages.*, users.username, users.first_name, users.last_name FROM messages JOIN users ON users.id = messages.from_member WHERE conversation_id = ?`, data);
};

export const getUnreadConversation = (data) : Promise<any> => {
    return mysqlParameterizedPromise(`SELECT * FROM messages WHERE ? AND status != 2`, data);
};

export const getUnreadMessageIds = (data) : Promise<any> => {
    return mysqlParameterizedPromise(`SELECT id, uuid FROM messages WHERE status != 2 AND conversation_id = ? AND to_member = ?`, data);
};

export const createMessage = (data) : Promise<any> => {
    return mysqlParameterizedPromise(`INSERT INTO messages SET ?`, data);
};

export const updateMessageStatus = (data, filter) : Promise<any> => {
    return mysqlParameterizedPromise(`UPDATE messages SET status = ? WHERE ${filter} = ?`, data);
};

export const setDeliveredStatus = (id) : Promise<any> => {
    return mysqlToPromise(`UPDATE messages SET status = 1 WHERE to_member = ${id} AND status = 0`);
};

export const setReadStatus = (id, conversationId) : Promise<any> => {
    return mysqlToPromise(`UPDATE messages SET status = 2 WHERE to_member = ${id} AND conversation_id = ${conversationId} AND status != 2`);
};

export const setMessageStatus = (ids: String, status: any) : Promise<any> => {
    return mysqlToPromise(`UPDATE messages SET status = ${status} WHERE id IN (${ids})`);
};

export const setMessageStatusByUuid = (uuids: String, status: any) : Promise<any> => {
    return mysqlToPromise(`UPDATE messages SET status = ${status} WHERE uuid IN ('${uuids}')`);
};

export const getMessageStatusByIds = (ids: String, status: any) : Promise<any> => {
    return mysqlToPromise(`SELECT * FROM messages WHERE id IN (${ids}) AND status = ${status}`);
};

export const countUnreadMessagesPerId = (ids: String, userId: number): Promise<any> => {
    return mysqlToPromise(`SELECT conversation_id, COUNT(messages.status) as unread_messages from messages where status != 2 AND conversation_id IN (${ids}) AND from_member != ${userId} GROUP BY conversation_id`);
};