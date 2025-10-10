# TrulyBot Shopify Integration Guide

## 🎯 Overview

The TrulyBot Shopify app seamlessly integrates your Shopify store with TrulyBot's AI chatbot, providing automated customer support, order tracking, and intelligent conversation management.

## ✨ Features

- **One-Click Installation**: Quick setup through Shopify App Store
- **OAuth Security**: Secure connection using Shopify's OAuth 2.0
- **Order Tracking**: Real-time order status and tracking information
- **Auto-Embedding**: Chatbot automatically appears on your store
- **Real-time Sync**: Instant updates from TrulyBot dashboard
- **Mobile Optimized**: Perfect experience on all devices

## 📋 Requirements

- Active Shopify store (any plan)
- TrulyBot Pro subscription or higher
- Store admin access for app installation
- Modern browser with JavaScript enabled

## 🚀 Installation Steps

### Step 1: Install the Shopify App

1. **Visit Shopify App Store**
   - Go to [apps.shopify.com/trulybot](https://apps.shopify.com/trulybot)
   - Or search "TrulyBot" in your Shopify Admin → Apps

2. **Install the App**
   - Click "Add app" button
   - Review app permissions:
     - Read orders (for order tracking)
     - Read customers (for customer support)
     - Manage script tags (for widget embedding)
   - Click "Install app" to confirm

3. **App Authorization**
   - Shopify will redirect you to TrulyBot app
   - The app will request necessary permissions
   - Click "Install" to complete authorization

### Step 2: Get Your TrulyBot User ID

1. **Access TrulyBot Dashboard**
   - Go to [trulybot.xyz](https://trulybot.xyz)
   - Log in to your account

2. **Navigate to Settings**
   - Go to Settings → Integration
   - Find your unique User ID
   - Copy this ID for the next step

### Step 3: Connect Your TrulyBot Account

1. **Open TrulyBot App**
   - In Shopify Admin, go to Apps → TrulyBot
   - You'll see the connection interface

2. **Enter Your User ID**
   - Paste your TrulyBot User ID
   - Click "Connect to TrulyBot"

3. **Automatic Configuration**
   The app will automatically:
   - Verify your TrulyBot account
   - Configure API permissions
   - Install the chatbot script on your store
   - Enable order tracking capabilities
   - Sync your store settings

## ⚙️ Configuration Options

### App Settings (Shopify Admin)

Access through Shopify Admin → Apps → TrulyBot:

- **Connection Status**: View integration status
- **Store Information**: See connected store details
- **Test Connection**: Verify API connectivity
- **Disconnect**: Remove integration if needed

### Chatbot Customization (TrulyBot Dashboard)

All appearance and behavior settings are managed in your TrulyBot dashboard:

#### Appearance
- **Theme**: Light or dark mode
- **Colors**: Accent color, button colors
- **Logo**: Upload custom chatbot avatar
- **Position**: Widget placement on page

#### Messages
- **Welcome Message**: First message customers see
- **Fallback Responses**: Default replies for unknown queries
- **Order Status Messages**: Custom tracking responses

#### Behavior
- **Response Style**: Formal, casual, or friendly
- **Proactive Messages**: Trigger messages based on user behavior
- **Operating Hours**: Set availability schedule

Changes in your TrulyBot dashboard appear instantly on your Shopify store.

## 🛒 Order Tracking Features

### Supported Order Lookups

Your chatbot can help customers find orders using:

#### Order Number
- "Track order #1001"
- "What's the status of order 1001?"
- "Where is my order #SP-1001?"

#### Customer Email
- "Show my orders for john@example.com"
- "Orders for this email address"

#### Phone Number
- "Track orders for phone 555-123-4567"
- Customer verification via phone

### Order Information Displayed

#### Order Status
- **Unfulfilled**: Order confirmed, preparing for shipment
- **Partially Fulfilled**: Some items shipped
- **Fulfilled**: All items shipped
- **Delivered**: Package delivered to customer

#### Order Details
- Order number and date
- Total amount and currency
- Payment status
- Shipping address
- Individual items and quantities

#### Tracking Information
- Shipping carrier and service
- Tracking number with clickable link
- Estimated delivery date
- Current package location
- Delivery confirmation

### Advanced Tracking Features

#### Multi-fulfillment Support
- Handle orders with multiple shipments
- Show individual tracking for each package
- Group related shipments

#### Return & Exchange Tracking
- Track return requests
- Exchange order status
- Refund processing updates

## 🎨 Customization Options

### Widget Appearance

#### Position Settings
- **Bottom Right**: Default position (recommended)
- **Bottom Left**: Alternative placement
- **Custom Position**: Advanced CSS positioning

#### Size and Style
- **Compact Mode**: Smaller widget for mobile
- **Full Mode**: Standard desktop experience
- **Auto-responsive**: Adapts to screen size

#### Color Schemes
- **Brand Colors**: Match your store theme
- **Seasonal Themes**: Holiday-specific colors
- **Custom CSS**: Advanced styling options

### Conversation Flow

#### Welcome Sequences
```
1. Greeting + Store name
2. Available services menu
3. Proactive assistance offer
```

#### Order Tracking Flow
```
1. Customer asks about order
2. Bot requests order number/email
3. Verify customer identity
4. Display order information
5. Offer additional help
```

#### Escalation Handling
- Automatic handoff to human support
- Integration with Shopify Inbox
- Email notification to store owners

## 🔧 Troubleshooting

### Common Issues

#### "App installation failed"
**Cause**: Browser or network issues
**Solution**:
1. Clear browser cache and cookies
2. Disable browser extensions temporarily
3. Try installing from different browser
4. Check internet connection stability

#### "TrulyBot connection failed"
**Cause**: Invalid User ID or account issues
**Solution**:
1. Verify User ID is copied correctly (no extra spaces)
2. Ensure TrulyBot account is active
3. Check subscription includes integration features
4. Try disconnecting and reconnecting

#### "Widget not appearing on store"
**Cause**: Script installation or theme conflicts
**Solution**:
1. Check if app is properly installed in Shopify Admin
2. Verify script tag is installed (Settings → Apps and sales channels)
3. Test in private/incognito browser window
4. Check for JavaScript errors in browser console
5. Contact theme developer about compatibility

#### "Order tracking not working"
**Cause**: API permissions or data access issues
**Solution**:
1. Verify app has "read_orders" permission
2. Test with recent orders (avoid very old orders)
3. Check order number format matches Shopify's
4. Ensure customer email/phone matches order

### Advanced Troubleshooting

#### Check Script Tag Installation
In Shopify Admin:
1. Go to Settings → Apps and sales channels
2. Look for "TrulyBot" script tag
3. Verify it's enabled and loading correctly

#### Test API Permissions
1. Go to Apps → TrulyBot in Shopify Admin
2. Click "Test Connection"
3. Review any error messages
4. Check app permissions in Settings → Apps and sales channels

#### Browser Console Debugging
1. Open browser developer tools (F12)
2. Check Console tab for JavaScript errors
3. Look for TrulyBot-related messages
4. Note any 404 or network errors

## 🔒 Security & Privacy

### Data Protection

#### Shopify OAuth Security
- Secure token-based authentication
- Automatic token refresh
- Limited scope permissions
- Encrypted data transmission

#### Customer Data Privacy
- Order data accessed only when requested
- No permanent storage of customer information
- GDPR-compliant data handling
- Customer consent for order lookups

#### API Security
- Rate limiting to prevent abuse
- IP-based access controls
- Audit logging of all requests
- Automatic threat detection

### Compliance Standards

#### GDPR Compliance
- Right to data access
- Right to data deletion
- Data processing transparency
- Lawful basis for processing

#### CCPA Compliance
- Consumer data rights
- Opt-out mechanisms
- Data sharing transparency
- Regular compliance audits

## 📊 Analytics & Insights

### Conversation Analytics

Track in TrulyBot dashboard:
- **Total Conversations**: Daily, weekly, monthly
- **Order Tracking Requests**: Most common queries
- **Response Times**: Average bot response speed
- **Customer Satisfaction**: Rating and feedback
- **Conversion Impact**: Sales influenced by chat

### Order Tracking Analytics

Monitor usage patterns:
- **Popular Tracking Times**: When customers check orders
- **Common Questions**: Most frequent order queries
- **Successful Resolutions**: Automated vs. escalated
- **Customer Journey**: From inquiry to satisfaction

### Performance Metrics

#### Technical Performance
- **Widget Load Time**: Speed of chatbot initialization
- **API Response Time**: Order lookup speed
- **Error Rates**: Failed requests and causes
- **Uptime**: Service availability

#### Business Impact
- **Support Ticket Reduction**: Automated resolution rate
- **Customer Satisfaction**: Survey responses
- **Repeat Purchases**: Customer retention impact
- **Revenue Attribution**: Sales influenced by chat

## 🎉 Advanced Features

### Proactive Messaging

#### Abandoned Cart Recovery
```
Trigger: Customer leaves items in cart for 30 minutes
Message: "Need help with your order? I can assist with checkout!"
```

#### Shipping Updates
```
Trigger: Order status changes to "Shipped"
Message: "Great news! Your order #1001 is on its way. Track it here: [link]"
```

#### Delivery Confirmation
```
Trigger: Package delivered
Message: "Your order has been delivered! How was your experience?"
```

### Multi-language Support

#### Automatic Detection
- Detect customer's browser language
- Switch chatbot language automatically
- Support for 20+ languages

#### Custom Translations
- Override default translations
- Add store-specific terminology
- Localize for regional markets

### Integration Extensions

#### Third-party Apps
- **Shopify Flow**: Automate responses based on triggers
- **Klaviyo**: Sync chat data with email marketing
- **Gorgias**: Escalate to human support seamlessly
- **ReCharge**: Handle subscription inquiries

#### Custom Webhooks
- Send chat events to external systems
- Sync customer data with CRM
- Trigger marketing automations
- Update inventory systems

## 📱 Mobile Optimization

### Responsive Design
- Automatically adapts to screen sizes
- Touch-friendly interface
- Optimized for mobile keyboards
- Fast loading on slow connections

### Mobile-specific Features
- **Swipe gestures**: Navigate chat history
- **Voice input**: Speak instead of typing
- **Push notifications**: Real-time order updates
- **Offline mode**: Cached responses when offline

## 🚀 Performance Optimization

### Loading Speed
- **Lazy Loading**: Widget loads after page content
- **CDN Delivery**: Global content distribution
- **Minified Scripts**: Optimized JavaScript
- **Cached Responses**: Faster repeat interactions

### Shopify Store Impact
- **Minimal Resource Usage**: <50KB total size
- **Non-blocking Scripts**: Doesn't slow page load
- **SEO Friendly**: No impact on search rankings
- **Core Web Vitals**: Optimized for Google metrics

## 🎯 Best Practices

### Store Setup
1. **Test thoroughly** before going live
2. **Train your team** on chatbot capabilities
3. **Monitor conversations** for improvement opportunities
4. **Keep product information** up to date
5. **Review analytics** regularly

### Customer Experience
1. **Set clear expectations** about chatbot capabilities
2. **Provide easy escalation** to human support
3. **Keep responses helpful** and friendly
4. **Test order tracking** with various order formats
5. **Gather feedback** from customers

### Maintenance
1. **Update TrulyBot settings** when store changes
2. **Review conversation logs** monthly
3. **Test integrations** after Shopify updates
4. **Monitor performance metrics** weekly
5. **Keep documentation** updated

## 📞 Support & Resources

### Getting Help
- **Documentation**: [docs.trulybot.xyz/shopify](https://docs.trulybot.xyz/shopify)
- **Video Tutorials**: [youtube.com/trulybot](https://youtube.com/trulybot)
- **Email Support**: support@trulybot.xyz
- **Live Chat**: Available 24/7 in TrulyBot dashboard
- **Community Forum**: [community.trulybot.xyz](https://community.trulybot.xyz)

### Developer Resources
- **API Documentation**: [api.trulybot.xyz](https://api.trulybot.xyz)
- **GitHub Repository**: [github.com/trulybot/shopify](https://github.com/trulybot/shopify)
- **Webhook Examples**: Code samples for custom integrations
- **Testing Tools**: Sandbox environment for development

### When Contacting Support
Include this information:
- Shopify store URL
- TrulyBot User ID
- Shopify plan details
- Browser and device information
- Detailed description of the issue
- Screenshots or error messages
- Steps to reproduce the problem

---

**Ready to get started?** Install TrulyBot from the [Shopify App Store](https://apps.shopify.com/trulybot) or contact our team at support@trulybot.xyz for personalized assistance.