interface ConversationMember {
    id?: number,
    username?: string,
    conversationId?: number, 
    memberId?: number, 
    firstName?: string, 
    lastName?: string, 
    email?: string, 
    registerId?: string,
    unreadMessages?: number,
    deleted?: boolean
}

export { ConversationMember }