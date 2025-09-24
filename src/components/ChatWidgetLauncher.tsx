'use client';
import React, { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function ChatWidgetLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          aria-label="Open chat"
          className="anemo-chat-bubble-btn"
          onClick={() => setOpen(true)}
        >
          <span className="bubble-emoji">🌀</span>
        </button>
      )}

      {open && (
        <>
          {/* Overlay for mobile only */}
          <div className="anemo-widget-overlay" onClick={() => setOpen(false)} />
          <div
            className="anemo-widget-modal"
            onClick={e => e.stopPropagation()}
          >
            <ChatWidget onClose={() => setOpen(false)} />
          </div>
        </>
      )}

      <style jsx global>{`
        .anemo-chat-bubble-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 62px;
          height: 62px;
          background: linear-gradient(135deg, #2563eb 60%, #1744ad 100%);
          border-radius: 50%;
          box-shadow: 0 8px 36px #2563eb66;
          border: none;
          cursor: pointer;
          z-index: 11001;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s;
        }
        .anemo-chat-bubble-btn:hover {
          transform: scale(1.07);
          box-shadow: 0 12px 40px #2563eb88;
        }
        .bubble-emoji {
          font-size: 2.2rem;
          color: #fff;
        }

        .anemo-widget-overlay {
          display: none;
        }
        @media (max-width: 700px) {
          .anemo-widget-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(16, 18, 21, 0.32);
            z-index: 12000;
            animation: anemo-fadein 0.18s;
          }
        }
        @keyframes anemo-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .anemo-widget-modal {
          position: fixed;
          right: 36px;
          bottom: 36px;
          width: 400px;
          max-width: 96vw;
          height: 600px;
          max-height: 94vh;
          background: #23272f;
          border-radius: 16px;
          box-shadow: 0 8px 36px 0 #0005, 0 1.5px 0 #2563eb40 inset;
          overflow: hidden;
          z-index: 12001;
          display: flex;
          flex-direction: column;
          animation: anemo-slidein 0.23s cubic-bezier(0.46,0.03,0.52,0.96);
          /* Removed border */
        }
        @keyframes anemo-slidein {
          from { transform: translateY(48px) scale(0.98); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @media (max-width: 700px) {
          .anemo-widget-modal {
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
            width: 100vw !important;
            height: 100dvh !important;
            max-width: none;
            max-height: none;
            border-radius: 0;
            box-shadow: none;
            animation: anemo-mobilein 0.24s cubic-bezier(0.46,0.03,0.52,0.96);
          }
          @keyframes anemo-mobilein {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: none; opacity: 1; }
          }
        }
      `}</style>
    </>
  );
}