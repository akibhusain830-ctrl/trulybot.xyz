# TrulyBot for WooCommerce

Connect your WooCommerce store with TrulyBot AI chatbot for automated customer support and order tracking.

## Description

TrulyBot for WooCommerce seamlessly integrates your online store with TrulyBot's advanced AI chatbot, providing customers with instant support and order tracking capabilities. The plugin automatically generates WooCommerce API credentials and connects to your TrulyBot dashboard for centralized management.

## Features

- **Automatic Integration**: One-click connection to your TrulyBot account
- **Order Tracking**: Customers can track orders directly through the chatbot
- **Real-time Sync**: All customizations from TrulyBot dashboard reflect instantly
- **Secure API**: Encrypted communication with read-only WooCommerce access
- **Customizable Widget**: Position and style the chatbot to match your brand
- **Multi-language Support**: Ready for translation

## Installation

### From WordPress Admin

1. Download the plugin ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin" and select the ZIP file
4. Install and activate the plugin
5. Go to TrulyBot menu in admin sidebar
6. Enter your TrulyBot User ID and click "Connect to TrulyBot"

### Manual Installation

1. Upload the `trulybot-woocommerce` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Configure the plugin in TrulyBot admin menu

## Setup Guide

### Step 1: Get Your TrulyBot User ID

1. Log in to your TrulyBot dashboard at [trulybot.xyz](https://trulybot.xyz)
2. Go to Settings → Integration
3. Copy your User ID

### Step 2: Connect Your Store

1. In WordPress admin, go to TrulyBot menu
2. Paste your User ID in the connection form
3. Click "Connect to TrulyBot"
4. The plugin will automatically:
   - Generate WooCommerce API credentials
   - Send them securely to TrulyBot
   - Enable the chatbot widget on your store

### Step 3: Customize Your Chatbot

1. Go to your TrulyBot dashboard
2. Customize appearance, messages, and behavior
3. Changes will appear instantly on your store

## Configuration

### Widget Settings

- **Widget Status**: Enable/disable the chatbot on frontend
- **Widget Position**: Choose bottom-right or bottom-left placement
- **Customization**: All visual settings managed in TrulyBot dashboard

### Order Tracking Features

The chatbot can help customers with:
- Order status lookup by order number
- Tracking information display
- Order history for registered customers
- Shipping updates and delivery status

## API Endpoints

The plugin creates secure REST API endpoints for TrulyBot:

- `GET /wp-json/trulybot/v1/orders/{order_id}` - Get specific order
- `GET /wp-json/trulybot/v1/orders/search` - Search orders by email/phone

## Security

- **Read-only Access**: API keys have read-only permissions
- **Encrypted Communication**: All data transmitted via HTTPS
- **Access Control**: Only authorized TrulyBot servers can access data
- **No Sensitive Data**: Customer payment info is never transmitted

## Requirements

- WordPress 5.0 or higher
- WooCommerce 6.0 or higher
- PHP 7.4 or higher
- SSL certificate (recommended)
- Active TrulyBot account

## Compatibility

### Tested With

- WordPress: 5.0 - 6.4
- WooCommerce: 6.0 - 8.5
- PHP: 7.4 - 8.2

### Third-party Plugins

- **WooCommerce Shipment Tracking**: Automatic tracking info integration
- **WooCommerce Sequential Order Numbers**: Order number compatibility
- **WPML**: Multi-language support ready

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to TrulyBot servers"
**Solution**: 
1. Check your internet connection
2. Verify TrulyBot User ID is correct
3. Ensure your server can make outbound HTTPS requests

**Problem**: "WooCommerce API test failed"
**Solution**:
1. Ensure WooCommerce is active and updated
2. Check WordPress permalink settings
3. Verify no security plugins are blocking REST API

### Widget Not Appearing

**Problem**: Chatbot widget not visible on frontend
**Solution**:
1. Check widget is enabled in TrulyBot settings
2. Clear any caching plugins
3. Verify no JavaScript errors in browser console

### Order Tracking Not Working

**Problem**: Customers can't track orders
**Solution**:
1. Test API connection in admin panel
2. Verify WooCommerce API credentials are valid
3. Check order numbers match WooCommerce format

## Support

### Documentation
- [TrulyBot Help Center](https://help.trulybot.xyz)
- [WooCommerce Integration Guide](https://docs.trulybot.xyz/woocommerce)

### Contact
- Email: support@trulybot.xyz
- Live Chat: Available in TrulyBot dashboard

### Bug Reports
Please report bugs with:
- WordPress version
- WooCommerce version
- PHP version
- Error message (if any)
- Steps to reproduce

## Changelog

### 1.0.0
- Initial release
- Automatic WooCommerce API integration
- Order tracking functionality
- Chatbot widget embedding
- Admin interface for connection management
- REST API endpoints for TrulyBot backend

## Privacy Policy

This plugin:
- Connects to TrulyBot servers for chatbot functionality
- Transmits order data for tracking features (with customer consent)
- Does not store sensitive payment information
- Complies with GDPR and data protection regulations

## License

GPL v2 or later. See LICENSE file for details.

## Credits

Developed by the TrulyBot team. Built with ❤️ for WooCommerce merchants.