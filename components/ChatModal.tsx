import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    otherUserId: string;
    otherUserName: string;
    otherUserRole: 'student' | 'teacher';
}

interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, otherUserId, otherUserName, otherUserRole }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = localStorage.getItem('userId') || '';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, otherUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chat/conversation/${otherUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: otherUserId,
                    receiverName: otherUserName,
                    content: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
                await fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl h-[600px] rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-black text-lg">
                            {otherUserName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl">{otherUserName}</h3>
                            <p className="text-blue-100 text-sm font-medium capitalize">{otherUserRole}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageCircle size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.senderId === currentUserId;
                            return (
                                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                        <div className={`rounded-2xl px-4 py-3 ${isOwn
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                        <p className={`text-xs text-slate-400 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={`p-3 rounded-xl font-bold transition-all flex items-center justify-center ${newMessage.trim() && !sending
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {sending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
