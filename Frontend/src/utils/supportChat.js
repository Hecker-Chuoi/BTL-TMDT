const SUPPORT_CHAT_KEY = 'supportConversations';
const SUPPORT_CHAT_EVENT = 'supportChatUpdated';
const SESSION_KEY = 'supportConversationId';

const safeParseArray = (value) => {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const readSupportConversations = () => {
    return safeParseArray(localStorage.getItem(SUPPORT_CHAT_KEY));
};

export const writeSupportConversations = (conversations) => {
    localStorage.setItem(SUPPORT_CHAT_KEY, JSON.stringify(conversations));
    window.dispatchEvent(new Event(SUPPORT_CHAT_EVENT));
};

export const getSupportCustomer = () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        return {
            id: currentUser.email,
            name: currentUser.name || currentUser.email,
            email: currentUser.email
        };
    }

    let guestId = sessionStorage.getItem('guestSupportId');
    if (!guestId) {
        guestId = `guest-${Date.now()}`;
        sessionStorage.setItem('guestSupportId', guestId);
    }

    return {
        id: guestId,
        name: 'Khách vãng lai',
        email: ''
    };
};

export const getOrCreateSupportConversation = () => {
    const customer = getSupportCustomer();
    let conversationId = sessionStorage.getItem(SESSION_KEY);
    let conversations = readSupportConversations();
    let conversation = conversationId
        ? conversations.find(item => item.id === conversationId)
        : conversations.find(item => item.customerId === customer.id && item.status === 'OPEN');

    if (!conversation) {
        conversation = {
            id: `conv-${Date.now()}`,
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [
                {
                    id: `msg-${Date.now()}`,
                    sender: 'admin',
                    text: 'Xin chào! TechStore có thể hỗ trợ gì cho bạn?',
                    createdAt: new Date().toISOString()
                }
            ]
        };
        conversations = [conversation, ...conversations];
        writeSupportConversations(conversations);
    }

    sessionStorage.setItem(SESSION_KEY, conversation.id);
    return conversation;
};

export const sendSupportMessage = (conversationId, sender, text) => {
    const conversations = readSupportConversations();
    const message = {
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sender,
        text,
        createdAt: new Date().toISOString()
    };

    const updatedConversations = conversations.map(conversation =>
        conversation.id === conversationId
            ? {
                ...conversation,
                status: 'OPEN',
                updatedAt: message.createdAt,
                messages: [...(conversation.messages || []), message]
            }
            : conversation
    );

    writeSupportConversations(updatedConversations);
    return message;
};

export const subscribeSupportConversations = (callback) => {
    const handler = () => callback(readSupportConversations());
    window.addEventListener(SUPPORT_CHAT_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
        window.removeEventListener(SUPPORT_CHAT_EVENT, handler);
        window.removeEventListener('storage', handler);
    };
};
