import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }
    
    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || lastMessage?.text || '';
    
    // Simple development responses for testing
    let response = '';
    
    if (userContent.toLowerCase().includes('pricing') || userContent.toLowerCase().includes('plans') || userContent.toLowerCase().includes('cost')) {
      response = `💰 **TrulyBot Pricing (INR):**

**Basic** — ₹499/month
• Perfect for small businesses
• Up to 1,000 replies/month
• Core AI responses & email support

**Pro** — ₹1,499/month ⭐ Most Popular
• Best for growing businesses
• Up to 3,000 replies/month
• Advanced AI with branding & analytics

**Enterprise** — ₹2,999/month
• For high volume teams
• Up to 15,000 replies/month
• Full customization + priority support

🎁 7-day FREE trial available — no credit card required.

Want me to help you choose the right plan?`;
    } else if (userContent.toLowerCase().includes('hello') || userContent.toLowerCase().includes('hi')) {
      response = `👋 Hello! Welcome to TrulyBot!

I can help you with:
• 💰 Pricing plans and features
• 🚀 Getting started with your free trial
• 🤖 Understanding our AI capabilities
• 📞 Setting up customer support automation

What would you like to know about TrulyBot?`;
    } else if (userContent.toLowerCase().includes('features') || userContent.toLowerCase().includes('capabilities')) {
      response = `🚀 **TrulyBot Features:**

**Core AI Capabilities:**
• Intelligent conversation handling
• 24/7 automated customer support
• Lead capture and qualification
• Multi-language support

**Customization Options:**
• Brand colors and theme
• Custom welcome messages
• Logo integration
• Personalized responses

**Integration & Analytics:**
• Website integration in minutes
• Real-time conversation analytics
• Performance tracking
• Export conversation data

Want to see it in action? Start your free trial!`;
    } else if (userContent.toLowerCase().includes('trial') || userContent.toLowerCase().includes('free')) {
      response = `🎁 **Free Trial Information:**

✅ 7-day FREE trial
✅ No credit card required
✅ Full Enterprise features during trial
✅ Generous reply allowances under fair use

**Getting Started:**
1. Sign up in 30 seconds
2. Add TrulyBot to your website
3. Customize your bot's appearance
4. Start helping customers instantly!

Ready to transform your customer support?`;
    } else {
      response = `🤖 Thanks for your message! I'm here to help you learn about TrulyBot.

I can provide information about:
• Pricing plans (₹499–₹2,999/month)
• Features and capabilities
• Free trial details
• Getting started guide

What specific information would you like to know?`;
    }
    
    // Return a simple text response
    return new NextResponse(response, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}