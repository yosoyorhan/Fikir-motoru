import React from 'react';
import { marked } from 'marked';
import { Persona, Message } from '../types';
import LoadingSpinner from './LoadingSpinner';

export const PersonaIcon: React.FC<{ persona: Persona; className?: string }> = ({ persona, className }) => {
  let icon;

  switch (persona) {
    case Persona.Moderator:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
      );
      break;
    case Persona.MarketResearcher:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      );
      break;
    case Persona.Developer:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      );
      break;
    case Persona.UserPersona:
    case Persona.User:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
      break;
    case Persona.FinansalAnalist:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      );
      break;
    case Persona.FikirBabası:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"></path>
        </svg>
      );
      break;
    case Persona.BigBoss:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
        </svg>
      );
      break;
    case Persona.System:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      );
      break;
    case Persona.HızSınırlarıUzmanı:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
      break;
     case Persona.Cerevo:
      icon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M15.5 18.5c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5c3.5 0 3.5 5 0 7z" />
            <path d="M8.5 11.5c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-3.5-5 0-7z" />
            <path d="M12 11.5V3a2.5 2.5 0 0 0-5 0v3" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
            <path d="M12 12.5V21" />
            <path d="M18 11a2.5 2.5 0 0 0-5 0v1.5" />
            <circle cx="13" cy="12.5" r="1.5" fill="currentColor" />
            <path d="M10 17a2.5 2.5 0 0 0-5 0v1" />
            <circle cx="5" cy="18" r="1.5" fill="currentColor" />
            <path d="M14 15.5a2.5 2.5 0 0 0 5 0V14" />
            <circle cx="19" cy="14" r="1.5" fill="currentColor" />
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