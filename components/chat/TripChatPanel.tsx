'use client';

import { useState, useEffect, useRef } from 'react';
import { TripMessage, Place } from '@/types';
import { ChatService } from '@/services/chatService';
import { Send, Sparkles } from 'lucide-react';

interface TripChatPanelProps {
  tripId: string;
  currentUserId: string;
  currentUserName: string;
  onInspectPlace?: (place: Place) => void;
}

export function TripChatPanel({
  tripId,
  currentUserId,
  currentUserName,
  onInspectPlace,
}: TripChatPanelProps) {
  const [messages, setMessages] = useState<TripMessage[]>(() => {
    return ChatService.getMessages(tripId);
  });
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to real-time chat messages
    const unsubscribe = ChatService.subscribeToTripChat(tripId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [tripId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const sent = ChatService.sendMessage({
      tripId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: inputText.trim(),
      type: 'text',
    });

    setMessages((prev) => [...prev, sent]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[580px] bg-white rounded-3xl border border-[#244536]/15 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 px-6 border-b border-[#244536]/10 bg-[#F7F5EF] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <h4 className="font-serif text-base font-medium text-[#244536]">
            Trip Planning Chat
          </h4>
        </div>
        <span className="text-xs text-[#5F6761]">
          {messages.length} messages · Synchronized live
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-[#5F6761]">
            <Sparkles className="w-8 h-8 text-[#C78363] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#244536]">Start the conversation</p>
            <p className="text-xs max-w-xs mx-auto">
              Discuss travel timings, propose hygiene-verified stops, and coordinate with your group members.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isSystem = msg.senderId === 'system';

            if (isSystem || msg.type === 'itinerary_update' || msg.type === 'vote_alert') {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="px-4 py-2 rounded-xl bg-[#F0F3EF] border border-[#244536]/10 text-xs text-[#244536] max-w-md text-center flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C78363] flex-shrink-0" />
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-[#5F6761]">
                  <span className="font-semibold text-[#244536]">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span>·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed space-y-2 shadow-xs ${
                    isMe
                      ? 'bg-[#244536] text-white rounded-br-none'
                      : 'bg-[#F7F5EF] text-[#292D2A] border border-[#244536]/10 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Attached Place Card if recommendation */}
                  {msg.attachedPlace && (
                    <div 
                      onClick={() => onInspectPlace && onInspectPlace(msg.attachedPlace!)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isMe 
                          ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white' 
                          : 'bg-white border-[#244536]/15 hover:border-[#244536]/30 text-[#292D2A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">
                          {msg.attachedPlace.name}
                        </span>
                        {msg.attachedPlace.hygieneScore && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isMe ? 'bg-white/20 text-white' : 'bg-[#E7ECE5] text-[#244536]'
                          }`}>
                            Score: {msg.attachedPlace.hygieneScore}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5">
                        {msg.attachedPlace.address} · +{msg.attachedPlace.detourKm || 0.8} km detour
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3.5 px-4 border-t border-[#244536]/10 bg-[#F7F5EF] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message or discuss a route stop..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#244536]/20 text-xs text-[#292D2A] focus:outline-none focus:ring-2 focus:ring-[#244536]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-[#244536] text-white hover:bg-[#1B3529] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
