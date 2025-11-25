'use client';

import { ChatMessage as ChatMessageType } from '@/types/claim';
import { Bot, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  return (
    <div
      className={`flex gap-3 ${isAssistant || isSystem ? 'justify-start' : 'justify-end'}`}
    >
      {(isAssistant || isSystem) && (
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isSystem ? 'bg-amber-100' : 'bg-blue-100'
          }`}
        >
          {isSystem ? (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          ) : (
            <Bot className="w-4 h-4 text-blue-600" />
          )}
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isAssistant
            ? 'bg-gray-100 text-gray-900'
            : isSystem
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-blue-600 text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {message.metadata?.aiHint && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              AI Insight: {message.metadata.aiHint}
            </p>
          </div>
        )}

        <p
          className={`text-xs mt-1 ${
            isAssistant || isSystem ? 'text-gray-500' : 'text-blue-200'
          }`}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </p>
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
