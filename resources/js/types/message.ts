export interface MessageUser {
    id: number;
    name: string;
}

export interface Message {
    id: number;
    message: string;
    is_read: boolean;
    is_mine: boolean;
    sender: MessageUser;
    receiver: MessageUser;
    created_at: string;
    updated_at: string;
}