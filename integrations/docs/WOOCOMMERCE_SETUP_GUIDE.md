# TrulyBot WooCommerce Integration Guide

## 🎯 Overview

The TrulyBot WooCommerce plugin seamlessly integrates your WordPress/WooCommerce store with TrulyBot's AI chatbot, enabling automated customer support and real-time order tracking.

## ✨ Features

- **Automatic Integration**: One-click connection to your TrulyBot account
- **Order Tracking**: Customers can track orders directly through the chatbot
- **Real-time Sync**: All customizations from TrulyBot dashboard reflect instantly
- **Secure API**: Encrypted communication with read-only WooCommerce access
- **Customizable Widget**: Position and style the chatbot to match your brand

## 📋 Requirements

- WordPress 5.0 or higher
- WooCommerce 6.0 or higher
- PHP 7.4 or higher
- SSL certificate (recommended)
- Active TrulyBot account

## 🚀 Installation Steps

### Step 1: Download & Install Plugin

1. **Download the Plugin**
   - Go to your TrulyBot dashboard → Integrations
   - Click "Download Plugin" for WooCommerce
   - Save `trulybot-woocommerce.zip` to your computer

2. **Install via WordPress Admin**
   ```
   WordPress Admin → Plugins → Add New → Upload Plugin
   ```
   - Choose the downloaded ZIP file
   - Click "Install Now"
   - Click "Activate"

3. **Manual Installation** (Alternative)
   - Extract the ZIP file
   - Upload `trulybot-woocommerce` folder to `/wp-content/plugins/`
   - Activate through WordPress Plugins menu

### Step 2: Get Your TrulyBot User ID

1. **Access TrulyBot Dashboard**
   - Go to [trulybot.xyz](https://trulybot.xyz)
   - Log in to your account

2. **Find Your User ID**
   - Navigate to Settings → Integration
   - Copy your unique User ID
   - Keep this handy for the next step

### Step 3: Connect Your Store

1. **Open TrulyBot Settings**
   - In WordPress admin, go to TrulyBot menu (sidebar)
   - You'll see the connection interface

2. **Enter Your User ID**
   - Paste your TrulyBot User ID in the connection form
   - Click "Connect to TrulyBot"

3. **Automatic Setup**
   The plugin will automatically:
   - Generate secure WooCommerce API credentials
   - Send them securely to TrulyBot servers
   - Enable the chatbot widget on your store
   - Configure order tracking capabilities

## ⚙️ Configuration

### Widget Settings

Access these in WordPress Admin → TrulyBot:

- **Widget Status**: Enable/disable chatbot on frontend
- **Widget Position**: Choose bottom-right or bottom-left placement
- **Connection Status**: View current integration status

### Chatbot Customization

All visual and behavioral settings are managed in your TrulyBot dashboard:

- **Appearance**: Colors, logo, theme
- **Messages**: Welcome message, responses
- **Behavior**: Response style, personality
- **Advanced**: Custom CSS, positioning

Changes in your TrulyBot dashboard appear instantly on your store.

## 🛠️ Order Tracking Features

Your chatbot can help customers with:

### Order Status Lookup
- Customers can ask: "What's the status of order #12345?"
- Bot displays current order status and details

### Order Information
- Order total and currency
- Items in the order
- Shipping address
- Order date and timeline

### Tracking Integration
- Automatic tracking number display
- Support for popular shipping plugins
- Delivery status updates

### Customer Verification
- Secure order lookup using customer email
- Phone number verification (optional)
- Privacy protection built-in

## 🔧 Troubleshooting

### Common Issues

#### "Failed to connect to TrulyBot servers"
**Cause**: Network connectivity or firewall issues
**Solution**:
1. Check your internet connection
2. Verify TrulyBot User ID is correct
3. Ensure your server can make outbound HTTPS requests
4. Contact your hosting provider about firewall settings

#### "WooCommerce API test failed"
**Cause**: WooCommerce or WordPress configuration issues
**Solution**:
1. Ensure WooCommerce is active and updated
2. Check WordPress permalink settings (Settings → Permalinks)
3. Verify no security plugins are blocking REST API
4. Try re-saving permalink structure

#### "Widget not appearing on frontend"
**Cause**: JavaScript errors or caching issues
**Solution**:
1. Check widget is enabled in TrulyBot settings
2. Clear any caching plugins (WP Rocket, W3 Total Cache, etc.)
3. Check browser console for JavaScript errors
4. Verify no JavaScript conflicts with other plugins

#### "Order tracking not working"
**Cause**: API permissions or order format issues
**Solution**:
1. Test connection in WordPress admin panel
2. Verify WooCommerce API credentials are valid
3. Check order numbers match WooCommerce format
4. Ensure orders exist and are accessible

### Advanced Troubleshooting

#### Enable Debug Mode
Add this to your `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check `/wp-content/debug.log` for detailed error messages.

#### Check API Endpoints
Test these URLs in your browser:
- `yoursite.com/wp-json/wc/v3/system_status`
- `yoursite.com/wp-json/trulybot/v1/orders/test`

#### Plugin Conflicts
Temporarily deactivate other plugins to identify conflicts:
1. Deactivate all plugins except WooCommerce and TrulyBot
2. Test if issue persists
3. Reactivate plugins one by one to find the culprit

## 🔒 Security & Privacy

### Data Protection
- **Read-only Access**: API keys have read-only permissions
- **Encrypted Storage**: All credentials encrypted in database
- **HTTPS Only**: All communication uses secure SSL
- **No Payment Data**: Credit card info never transmitted

### GDPR Compliance
- Customer order data only accessed with permission
- No personal data stored on TrulyBot servers
- Customers can request data deletion
- Full audit trail of data access

### Access Control
- Only authorized TrulyBot servers can access data
- API requests include verification tokens
- Failed attempts are logged and monitored
- Automatic credential rotation available

## 🧪 Testing Your Integration

### Basic Functionality Test
1. Visit your store's frontend
2. Look for the TrulyBot chat widget
3. Click to open the chat
4. Send a test message

### Order Tracking Test
1. Create a test order in WooCommerce
2. Note the order number
3. In the chat, ask: "Track order #[order-number]"
4. Verify order details are displayed correctly

### Customization Test
1. Change chatbot color in TrulyBot dashboard
2. Refresh your store page
3. Verify new color appears immediately

## 📞 Support

### Getting Help
- **Documentation**: [docs.trulybot.xyz/woocommerce](https://docs.trulybot.xyz/woocommerce)
- **Email Support**: support@trulybot.xyz
- **Live Chat**: Available in TrulyBot dashboard
- **Community**: [community.trulybot.xyz](https://community.trulybot.xyz)

### When Contacting Support
Please include:
- WordPress version
- WooCommerce version
- PHP version
- Plugin version
- Error message (if any)
- Steps to reproduce the issue

## 🔄 Updates & Maintenance

### Automatic Updates
- Plugin updates are delivered through WordPress
- Critical security updates are pushed automatically
- You'll be notified of available updates in WordPress admin

### Backup Recommendations
Before updating:
1. Backup your WordPress site
2. Test updates on staging environment first
3. Keep TrulyBot settings backed up

### Maintenance Tasks
- Regularly update WordPress and WooCommerce
- Monitor plugin compatibility with updates
- Review security logs monthly
- Test order tracking functionality quarterly

## 🎉 Advanced Tips

### Performance Optimization
1. **Enable Caching**: Use a caching plugin for better performance
2. **CDN Integration**: Consider using a CDN for global customers
3. **Image Optimization**: Optimize chatbot logo for faster loading

### Customization Ideas
1. **Custom Welcome Messages**: Tailor messages for different pages
2. **Seasonal Themes**: Change colors for holidays/sales
3. **Multi-language Support**: Configure messages for different languages

### Analytics & Insights
- Monitor chat engagement in TrulyBot dashboard
- Track order tracking requests
- Analyze customer satisfaction scores
- Review common support questions

## 📈 Best Practices

### Customer Experience
- Keep welcome messages friendly and helpful
- Respond to common questions proactively
- Test order tracking regularly
- Monitor response times

### Store Integration
- Match chatbot colors to your brand
- Position widget for maximum visibility
- Train staff on chatbot capabilities
- Update product information regularly

### Security Maintenance
- Review API access logs monthly
- Update credentials if compromised
- Monitor for unusual activity
- Keep WordPress and plugins updated

---

**Need help?** Contact our support team at support@trulybot.xyz or visit our documentation at [docs.trulybot.xyz](https://docs.trulybot.xyz)