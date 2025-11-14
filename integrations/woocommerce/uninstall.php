<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove plugin options and scheduled hooks without external calls
delete_option('trulybot_wc_settings');
wp_clear_scheduled_hook('trulybot_cleanup_logs');

