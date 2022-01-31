interface Message {
    id?: number,
    conversationId?: number,
    uuid?: string,
    fromMember?: number,
    toMember?: number,
    text?: string,
    status?: number,
    createdAt?: string,
    updatedAt?: string
}

export { Message }