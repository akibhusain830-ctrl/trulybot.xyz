<?php
/**
 * Plugin Name: TrulyBot for WooCommerce
 * Plugin URI: https://trulybot.xyz
 * Description: Integrate TrulyBot AI chatbot with your WooCommerce store for automated customer support and order tracking.
 * Version: 1.0.0
 * Author: TrulyBot
 * Author URI: https://trulybot.xyz
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: trulybot-woocommerce
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.5
 *
 * @package TrulyBot_WooCommerce
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('TRULYBOT_WC_VERSION', '1.0.0');
define('TRULYBOT_WC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TRULYBOT_WC_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('TRULYBOT_WC_API_BASE', 'https://trulybot.xyz/api');

/**
 * Main TrulyBot WooCommerce Plugin Class
 */
class TrulyBot_WooCommerce {
    
    /**
     * Instance of this class
     */
    private static $instance = null;
    
    /**
     * Get single instance of this class
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('plugins_loaded', array($this, 'plugins_loaded'));
        
        // Hook into plugin activation and deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('trulybot-woocommerce', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Check if WooCommerce is active
        if (!$this->is_woocommerce_active()) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        // Initialize admin interface
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'admin_init'));
            add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        }
        
        // Add chatbot widget to frontend
        add_action('wp_footer', array($this, 'add_chatbot_widget'));
        
        // AJAX handlers
        add_action('wp_ajax_trulybot_connect', array($this, 'ajax_connect_trulybot'));
        add_action('wp_ajax_trulybot_disconnect', array($this, 'ajax_disconnect_trulybot'));
        add_action('wp_ajax_trulybot_test_connection', array($this, 'ajax_test_connection'));
        
        // API endpoint for TrulyBot backend
        add_action('rest_api_init', array($this, 'register_rest_endpoints'));
    }
    
    /**
     * Check if WooCommerce is active
     */
    private function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
    
    /**
     * Display notice if WooCommerce is not active
     */
    public function woocommerce_missing_notice() {
        echo '<div class="notice notice-error"><p>';
        echo __('TrulyBot for WooCommerce requires WooCommerce to be installed and active.', 'trulybot-woocommerce');
        echo '</p></div>';
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create default options
        add_option('trulybot_wc_settings', array(
            'connected' => false,
            'api_key' => '',
            'api_secret' => '',
            'trulybot_user_id' => '',
            'widget_enabled' => false,
            'widget_position' => 'bottom-right',
            'created_at' => current_time('mysql')
        ));
        
        // Schedule cleanup event
        wp_schedule_event(time(), 'daily', 'trulybot_cleanup_logs');
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clear scheduled events
        wp_clear_scheduled_hook('trulybot_cleanup_logs');
        
        // Disconnect from TrulyBot if connected
        $this->disconnect_from_trulybot();
    }
    
    /**
     * Plugins loaded hook
     */
    public function plugins_loaded() {
        // Additional initialization after all plugins are loaded
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('TrulyBot', 'trulybot-woocommerce'),
            __('TrulyBot', 'trulybot-woocommerce'),
            'manage_woocommerce',
            'trulybot-wc',
            array($this, 'admin_page'),
            'dashicons-format-chat',
            56
        );
    }
    
    /**
     * Admin initialization
     */
    public function admin_init() {
        // Register settings
        register_setting('trulybot_wc_settings', 'trulybot_wc_settings');
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function admin_scripts($hook) {
        if ($hook !== 'toplevel_page_trulybot-wc') {
            return;
        }
        
        wp_enqueue_script('trulybot-admin', TRULYBOT_WC_PLUGIN_URL . 'assets/admin.js', array('jquery'), TRULYBOT_WC_VERSION, true);
        wp_enqueue_style('trulybot-admin', TRULYBOT_WC_PLUGIN_URL . 'assets/admin.css', array(), TRULYBOT_WC_VERSION);
        
        // Localize script for AJAX
        wp_localize_script('trulybot-admin', 'trulybot_ajax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('trulybot_nonce'),
            'messages' => array(
                'connecting' => __('Connecting to TrulyBot...', 'trulybot-woocommerce'),
                'connected' => __('Successfully connected to TrulyBot!', 'trulybot-woocommerce'),
                'disconnected' => __('Disconnected from TrulyBot', 'trulybot-woocommerce'),
                'error' => __('Connection failed. Please try again.', 'trulybot-woocommerce'),
                'testing' => __('Testing connection...', 'trulybot-woocommerce')
            )
        ));
    }
    
    /**
     * Admin page content
     */
    public function admin_page() {
        $settings = get_option('trulybot_wc_settings', array());
        $is_connected = isset($settings['connected']) && $settings['connected'];
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('TrulyBot for WooCommerce', 'trulybot-woocommerce'); ?></h1>
            
            <div class="trulybot-admin-container">
                <div class="trulybot-connection-status">
                    <?php if ($is_connected): ?>
                        <div class="notice notice-success inline">
                            <p><span class="dashicons dashicons-yes-alt"></span> 
                               <?php echo esc_html__('Connected to TrulyBot', 'trulybot-woocommerce'); ?>
                            </p>
                        </div>
                    <?php else: ?>
                        <div class="notice notice-warning inline">
                            <p><span class="dashicons dashicons-warning"></span> 
                               <?php echo esc_html__('Not connected to TrulyBot', 'trulybot-woocommerce'); ?>
                            </p>
                        </div>
                    <?php endif; ?>
                </div>
                
                <?php if (!$is_connected): ?>
                    <!-- Connection Form -->
                    <div class="trulybot-connect-section">
                        <h2><?php echo esc_html__('Connect Your TrulyBot Account', 'trulybot-woocommerce'); ?></h2>
                        <p><?php echo esc_html__('Enter your TrulyBot User ID to connect your chatbot to this WooCommerce store.', 'trulybot-woocommerce'); ?></p>
                        
                        <form id="trulybot-connect-form">
                            <table class="form-table">
                                <tr>
                                    <th scope="row"><?php echo esc_html__('TrulyBot User ID', 'trulybot-woocommerce'); ?></th>
                                    <td>
                                        <input type="text" name="trulybot_user_id" id="trulybot_user_id" class="regular-text" required />
                                        <p class="description">
                                            <?php echo esc_html__('You can find your User ID in your TrulyBot dashboard under Settings.', 'trulybot-woocommerce'); ?>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p class="submit">
                                <button type="submit" class="button button-primary" id="connect-btn">
                                    <?php echo esc_html__('Connect to TrulyBot', 'trulybot-woocommerce'); ?>
                                </button>
                            </p>
                        </form>
                    </div>
                <?php else: ?>
                    <!-- Connected State -->
                    <div class="trulybot-settings-section">
                        <h2><?php echo esc_html__('TrulyBot Settings', 'trulybot-woocommerce'); ?></h2>
                        
                        <form method="post" action="options.php">
                            <?php settings_fields('trulybot_wc_settings'); ?>
                            
                            <table class="form-table">
                                <tr>
                                    <th scope="row"><?php echo esc_html__('User ID', 'trulybot-woocommerce'); ?></th>
                                    <td>
                                        <code><?php echo esc_html($settings['trulybot_user_id'] ?? ''); ?></code>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><?php echo esc_html__('Widget Status', 'trulybot-woocommerce'); ?></th>
                                    <td>
                                        <label>
                                            <input type="checkbox" name="trulybot_wc_settings[widget_enabled]" value="1" 
                                                   <?php checked(isset($settings['widget_enabled']) && $settings['widget_enabled']); ?> />
                                            <?php echo esc_html__('Enable chatbot widget on frontend', 'trulybot-woocommerce'); ?>
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><?php echo esc_html__('Widget Position', 'trulybot-woocommerce'); ?></th>
                                    <td>
                                        <select name="trulybot_wc_settings[widget_position]">
                                            <option value="bottom-right" <?php selected($settings['widget_position'] ?? '', 'bottom-right'); ?>>
                                                <?php echo esc_html__('Bottom Right', 'trulybot-woocommerce'); ?>
                                            </option>
                                            <option value="bottom-left" <?php selected($settings['widget_position'] ?? '', 'bottom-left'); ?>>
                                                <?php echo esc_html__('Bottom Left', 'trulybot-woocommerce'); ?>
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            </table>
                            
                            <?php submit_button(); ?>
                        </form>
                        
                        <hr />
                        
                        <div class="trulybot-actions">
                            <button type="button" class="button" id="test-connection-btn">
                                <?php echo esc_html__('Test Connection', 'trulybot-woocommerce'); ?>
                            </button>
                            <button type="button" class="button button-secondary" id="disconnect-btn">
                                <?php echo esc_html__('Disconnect', 'trulybot-woocommerce'); ?>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Preview Section -->
                    <div class="trulybot-preview-section">
                        <h2><?php echo esc_html__('Chatbot Preview', 'trulybot-woocommerce'); ?></h2>
                        <div id="trulybot-preview-container">
                            <p><?php echo esc_html__('Your chatbot will appear here on the frontend with order tracking capabilities.', 'trulybot-woocommerce'); ?></p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * AJAX handler for connecting to TrulyBot
     */
    public function ajax_connect_trulybot() {
        check_ajax_referer('trulybot_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_die(__('Insufficient permissions', 'trulybot-woocommerce'));
        }
        
        $user_id = sanitize_text_field($_POST['user_id'] ?? '');
        
        if (empty($user_id)) {
            wp_send_json_error(__('User ID is required', 'trulybot-woocommerce'));
        }
        
        // Generate WooCommerce API credentials
        $api_credentials = $this->generate_woocommerce_api_credentials();
        
        if (!$api_credentials) {
            wp_send_json_error(__('Failed to generate WooCommerce API credentials', 'trulybot-woocommerce'));
        }
        
        // Send credentials to TrulyBot backend
        $connection_result = $this->send_credentials_to_trulybot($user_id, $api_credentials);
        
        if ($connection_result['success']) {
            // Save settings
            $settings = get_option('trulybot_wc_settings', array());
            $settings['connected'] = true;
            $settings['trulybot_user_id'] = $user_id;
            $settings['api_key'] = $api_credentials['key'];
            $settings['api_secret'] = $api_credentials['secret'];
            $settings['widget_enabled'] = true;
            $settings['connected_at'] = current_time('mysql');
            
            update_option('trulybot_wc_settings', $settings);
            
            wp_send_json_success(__('Successfully connected to TrulyBot!', 'trulybot-woocommerce'));
        } else {
            wp_send_json_error($connection_result['message']);
        }
    }
    
    /**
     * AJAX handler for disconnecting from TrulyBot
     */
    public function ajax_disconnect_trulybot() {
        check_ajax_referer('trulybot_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_die(__('Insufficient permissions', 'trulybot-woocommerce'));
        }
        
        $this->disconnect_from_trulybot();
        wp_send_json_success(__('Successfully disconnected from TrulyBot', 'trulybot-woocommerce'));
    }
    
    /**
     * AJAX handler for testing connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('trulybot_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_die(__('Insufficient permissions', 'trulybot-woocommerce'));
        }
        
        $settings = get_option('trulybot_wc_settings', array());
        
        if (!isset($settings['connected']) || !$settings['connected']) {
            wp_send_json_error(__('Not connected to TrulyBot', 'trulybot-woocommerce'));
        }
        
        // Test WooCommerce API
        $test_result = $this->test_woocommerce_api($settings['api_key'], $settings['api_secret']);
        
        if ($test_result['success']) {
            wp_send_json_success(__('Connection test successful!', 'trulybot-woocommerce'));
        } else {
            wp_send_json_error($test_result['message']);
        }
    }
    
    /**
     * Generate WooCommerce API credentials
     */
    private function generate_woocommerce_api_credentials() {
        global $wpdb;
        
        try {
            // Generate API key and secret
            $key = 'ck_' . wc_rand_hash();
            $secret = 'cs_' . wc_rand_hash();
            
            // Create API key in WooCommerce
            $data = array(
                'user_id' => get_current_user_id(),
                'description' => 'TrulyBot Integration - ' . date('Y-m-d H:i:s'),
                'permissions' => 'read',
                'consumer_key' => wc_api_hash($key),
                'consumer_secret' => $secret,
                'nonces' => '',
                'truncated_key' => substr($key, -7)
            );
            
            $wpdb->insert(
                $wpdb->prefix . 'woocommerce_api_keys',
                $data,
                array('%d', '%s', '%s', '%s', '%s', '%s', '%s')
            );
            
            if ($wpdb->last_error) {
                error_log('TrulyBot WC: Database error - ' . $wpdb->last_error);
                return false;
            }
            
            return array(
                'key' => $key,
                'secret' => $secret,
                'permissions' => 'read'
            );
            
        } catch (Exception $e) {
            error_log('TrulyBot WC: Exception in generate_woocommerce_api_credentials - ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send API credentials to TrulyBot backend
     */
    private function send_credentials_to_trulybot($user_id, $credentials) {
        $payload = array(
            'user_id' => $user_id,
            'platform' => 'woocommerce',
            'store_url' => home_url(),
            'api_key' => $credentials['key'],
            'api_secret' => $credentials['secret'],
            'permissions' => $credentials['permissions'],
            'store_name' => get_bloginfo('name'),
            'store_email' => get_option('admin_email'),
            'plugin_version' => TRULYBOT_WC_VERSION
        );
        
        $response = wp_remote_post(TRULYBOT_WC_API_BASE . '/integrations/woocommerce/connect', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-Plugin-Source' => 'woocommerce'
            ),
            'body' => json_encode($payload),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => __('Failed to connect to TrulyBot servers: ', 'trulybot-woocommerce') . $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            return array(
                'success' => false,
                'message' => __('TrulyBot server returned error: ', 'trulybot-woocommerce') . $response_code
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (isset($data['success']) && $data['success']) {
            return array(
                'success' => true,
                'message' => __('Successfully connected to TrulyBot', 'trulybot-woocommerce')
            );
        } else {
            return array(
                'success' => false,
                'message' => $data['message'] ?? __('Unknown error occurred', 'trulybot-woocommerce')
            );
        }
    }
    
    /**
     * Test WooCommerce API connection
     */
    private function test_woocommerce_api($key, $secret) {
        try {
            $url = home_url('/wp-json/wc/v3/system_status');
            
            $response = wp_remote_get($url, array(
                'headers' => array(
                    'Authorization' => 'Basic ' . base64_encode($key . ':' . $secret)
                ),
                'timeout' => 15
            ));
            
            if (is_wp_error($response)) {
                return array(
                    'success' => false,
                    'message' => __('API test failed: ', 'trulybot-woocommerce') . $response->get_error_message()
                );
            }
            
            $response_code = wp_remote_retrieve_response_code($response);
            
            if ($response_code === 200) {
                return array(
                    'success' => true,
                    'message' => __('WooCommerce API is working correctly', 'trulybot-woocommerce')
                );
            } else {
                return array(
                    'success' => false,
                    'message' => __('API test failed with code: ', 'trulybot-woocommerce') . $response_code
                );
            }
            
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => __('API test exception: ', 'trulybot-woocommerce') . $e->getMessage()
            );
        }
    }
    
    /**
     * Disconnect from TrulyBot
     */
    private function disconnect_from_trulybot() {
        $settings = get_option('trulybot_wc_settings', array());
        
        // Notify TrulyBot backend about disconnection
        if (isset($settings['trulybot_user_id'])) {
            wp_remote_post(TRULYBOT_WC_API_BASE . '/integrations/woocommerce/disconnect', array(
                'headers' => array(
                    'Content-Type' => 'application/json'
                ),
                'body' => json_encode(array(
                    'user_id' => $settings['trulybot_user_id'],
                    'store_url' => home_url()
                )),
                'timeout' => 15
            ));
        }
        
        // Remove API keys from database
        if (isset($settings['api_key'])) {
            global $wpdb;
            $wpdb->delete(
                $wpdb->prefix . 'woocommerce_api_keys',
                array('consumer_key' => wc_api_hash($settings['api_key']))
            );
        }
        
        // Reset settings
        update_option('trulybot_wc_settings', array(
            'connected' => false,
            'api_key' => '',
            'api_secret' => '',
            'trulybot_user_id' => '',
            'widget_enabled' => false,
            'widget_position' => 'bottom-right'
        ));
    }
    
    /**
     * Add chatbot widget to frontend
     */
    public function add_chatbot_widget() {
        $settings = get_option('trulybot_wc_settings', array());
        
        // Only show widget if connected and enabled
        if (!isset($settings['connected']) || !$settings['connected'] || 
            !isset($settings['widget_enabled']) || !$settings['widget_enabled']) {
            return;
        }
        
        $user_id = $settings['trulybot_user_id'] ?? '';
        $position = $settings['widget_position'] ?? 'bottom-right';
        
        if (empty($user_id)) {
            return;
        }
        
        ?>
        <script>
        (function() {
            // TrulyBot Widget Configuration
            window.trulyBotConfig = {
                userId: '<?php echo esc_js($user_id); ?>',
                platform: 'woocommerce',
                position: '<?php echo esc_js($position); ?>',
                storeUrl: '<?php echo esc_js(home_url()); ?>',
                currency: '<?php echo esc_js(get_woocommerce_currency()); ?>',
                orderTracking: true
            };
            
            // Load TrulyBot widget
            var script = document.createElement('script');
            script.src = '<?php echo esc_url(TRULYBOT_WC_API_BASE); ?>/widget/woocommerce.js';
            script.async = true;
            document.head.appendChild(script);
        })();
        </script>
        <?php
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_rest_endpoints() {
        register_rest_route('trulybot/v1', '/orders/(?P<order_id>[a-zA-Z0-9-]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_order_by_id'),
            'permission_callback' => array($this, 'verify_trulybot_request'),
            'args' => array(
                'order_id' => array(
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
        
        register_rest_route('trulybot/v1', '/orders/search', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_orders'),
            'permission_callback' => array($this, 'verify_trulybot_request'),
            'args' => array(
                'email' => array(
                    'sanitize_callback' => 'sanitize_email'
                ),
                'phone' => array(
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
    }
    
    /**
     * Permission callback for REST API endpoints
     */
    public function verify_trulybot_request($request) {
        $settings = get_option('trulybot_wc_settings', array());
        
        if (!isset($settings['connected']) || !$settings['connected']) {
            return false;
        }
        
        // Verify request comes from TrulyBot servers
        $auth_header = $request->get_header('authorization');
        if (empty($auth_header)) {
            return false;
        }
        
        // Extract and verify API credentials
        if (preg_match('/Basic\s+(.*)$/i', $auth_header, $matches)) {
            $credentials = base64_decode($matches[1]);
            list($key, $secret) = explode(':', $credentials, 2);
            
            return ($key === $settings['api_key'] && $secret === $settings['api_secret']);
        }
        
        return false;
    }
    
    /**
     * Get order by ID endpoint
     */
    public function get_order_by_id($request) {
        $order_id = $request->get_param('order_id');
        
        // Try to get order by order number first, then by ID
        $order = wc_get_order($order_id);
        
        if (!$order) {
            // Try searching by order number
            $orders = wc_get_orders(array(
                'meta_key' => '_order_number',
                'meta_value' => $order_id,
                'limit' => 1
            ));
            
            if (!empty($orders)) {
                $order = $orders[0];
            }
        }
        
        if (!$order) {
            return new WP_Error('order_not_found', 'Order not found', array('status' => 404));
        }
        
        return rest_ensure_response($this->format_order_data($order));
    }
    
    /**
     * Search orders endpoint
     */
    public function search_orders($request) {
        $email = $request->get_param('email');
        $phone = $request->get_param('phone');
        
        $args = array(
            'limit' => 10,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        if ($email) {
            $args['billing_email'] = $email;
        }
        
        if ($phone) {
            $args['meta_query'] = array(
                'relation' => 'OR',
                array(
                    'key' => '_billing_phone',
                    'value' => $phone,
                    'compare' => 'LIKE'
                )
            );
        }
        
        $orders = wc_get_orders($args);
        $formatted_orders = array();
        
        foreach ($orders as $order) {
            $formatted_orders[] = $this->format_order_data($order);
        }
        
        return rest_ensure_response($formatted_orders);
    }
    
    /**
     * Format order data for API response
     */
    private function format_order_data($order) {
        return array(
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'status_label' => wc_get_order_status_name($order->get_status()),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'date_modified' => $order->get_date_modified() ? $order->get_date_modified()->format('Y-m-d H:i:s') : null,
            'customer' => array(
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone()
            ),
            'billing_address' => array(
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country()
            ),
            'shipping_address' => array(
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country()
            ),
            'items' => $this->get_order_items($order),
            'tracking_info' => $this->get_tracking_info($order)
        );
    }
    
    /**
     * Get order items
     */
    private function get_order_items($order) {
        $items = array();
        
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            
            $items[] = array(
                'id' => $item_id,
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total(),
                'product_id' => $product ? $product->get_id() : null,
                'sku' => $product ? $product->get_sku() : null
            );
        }
        
        return $items;
    }
    
    /**
     * Get tracking information
     */
    private function get_tracking_info($order) {
        // Support for popular tracking plugins
        $tracking_info = array();
        
        // WooCommerce Shipment Tracking
        if (function_exists('wc_st_get_tracking_items')) {
            $tracking_items = wc_st_get_tracking_items($order->get_id());
            foreach ($tracking_items as $tracking_item) {
                $tracking_info[] = array(
                    'provider' => $tracking_item['tracking_provider'],
                    'number' => $tracking_item['tracking_number'],
                    'date_shipped' => $tracking_item['date_shipped'] ?? null
                );
            }
        }
        
        return $tracking_info;
    }
}

// Initialize the plugin
TrulyBot_WooCommerce::getInstance();