// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Anemo.ai',
  description: 'Smartest AI Chatbot for E-Commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}