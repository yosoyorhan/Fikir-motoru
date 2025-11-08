import React from 'react';
import { marked } from 'marked';
import { Persona, Message } from '../types';
import LoadingSpinner from './LoadingSpinner';

export const PersonaIcon: React.FC<{ persona: Persona; className?: string }> = ({ persona, className }) => {
  let icon;

  switch (persona) {
    case Persona.Moderator:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
      break;
    case Persona.MarketResearcher:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
      break;
    case Persona.Developer:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
      break;
    case Persona.UserPersona:
    case Persona.User:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
      break;
    case Persona.FinansalAnalist:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
      break;
    case Persona.FikirBabası:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
      break;
    case Persona.BigBoss:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      break;
    case Persona.System:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
      break;
    case Persona.HızSınırlarıUzmanı:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
     case Persona.Cerevo:
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    default:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
  }

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[var(--text-primary)] ${className}`}>
      {icon}
    </div>
  );
};


interface ChatBubbleProps {
  message: Message;
  isChatMode: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isChatMode }) => {
  const isUser = message.sender === Persona.User || message.sender === Persona.BigBoss;
  const isSystem = message.sender === Persona.System;

  // In chat mode, we don't show info for the main participants (User and Cerevo)
  const isChatParticipant = message.sender === Persona.User || message.sender === Persona.Cerevo;
  const showPersonaInfo = !isChatMode || !isChatParticipant;

  const bubbleClasses = isUser
    ? 'bg-[var(--chat-bubble-user-bg)]'
    : isSystem
    ? 'bg-transparent text-center w-full'
    : 'bg-[var(--chat-bubble-ai-bg)]';

  const alignmentClasses = isUser
    ? 'justify-end'
    : isSystem
    ? 'justify-center'
    : 'justify-start';

  const textAlignment = isSystem ? 'text-center' : 'text-left';
  
  const renderedText = message.text ? marked.parse(message.text, { gfm: true, breaks: true }) : '';

  if (isSystem) {
      return (
          <div className="flex justify-center my-4">
              <p className="text-sm text-[var(--text-secondary)] italic px-4 py-1 bg-[var(--bg-secondary)]/50 rounded-full">{message.text}</p>
          </div>
      )
  }

  return (
    <div className={`flex items-end gap-3 my-4 animate-fade-in ${alignmentClasses}`}>
      {!isUser && !isSystem && showPersonaInfo && <PersonaIcon persona={message.sender} className="bg-[var(--bg-secondary)]" />}

      <div className={`max-w-xl lg:max-w-2xl rounded-2xl p-4 shadow-sm ${bubbleClasses}`}>
        {!isSystem && showPersonaInfo && <p className="font-bold text-sm mb-1 text-[var(--text-primary)]">{message.sender}</p>}
        
        {message.isThinking ? (
          <LoadingSpinner />
        ) : (
          <div
            className={`prose prose-sm dark:prose-invert max-w-none text-[var(--text-secondary)] ${textAlignment}`}
            dangerouslySetInnerHTML={{ __html: renderedText }}
          />
        )}
      </div>

      {isUser && showPersonaInfo && <PersonaIcon persona={message.sender} className="bg-[var(--bg-secondary)]" />}
    </div>
  );
};

export default ChatBubble;