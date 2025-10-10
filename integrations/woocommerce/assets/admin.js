jQuery(document).ready(function($) {
    'use strict';
    
    // Connection form handler
    $('#trulybot-connect-form').on('submit', function(e) {
        e.preventDefault();
        
        const $form = $(this);
        const $submitBtn = $('#connect-btn');
        const $userIdField = $('#trulybot_user_id');
        const userId = $userIdField.val().trim();
        
        if (!userId) {
            showMessage('error', 'Please enter your TrulyBot User ID');
            return;
        }
        
        // Disable form during submission
        $submitBtn.prop('disabled', true).text(trulybot_ajax.messages.connecting);
        $userIdField.prop('disabled', true);
        
        $.ajax({
            url: trulybot_ajax.ajaxurl,
            type: 'POST',
            data: {
                action: 'trulybot_connect',
                user_id: userId,
                nonce: trulybot_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    showMessage('success', response.data);
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                } else {
                    showMessage('error', response.data);
                    resetForm();
                }
            },
            error: function(xhr, status, error) {
                showMessage('error', 'Connection failed: ' + error);
                resetForm();
            }
        });
        
        function resetForm() {
            $submitBtn.prop('disabled', false).text('Connect to TrulyBot');
            $userIdField.prop('disabled', false);
        }
    });
    
    // Disconnect button handler
    $('#disconnect-btn').on('click', function(e) {
        e.preventDefault();
        
        if (!confirm('Are you sure you want to disconnect from TrulyBot? This will disable the chatbot on your store.')) {
            return;
        }
        
        const $btn = $(this);
        $btn.prop('disabled', true).text('Disconnecting...');
        
        $.ajax({
            url: trulybot_ajax.ajaxurl,
            type: 'POST',
            data: {
                action: 'trulybot_disconnect',
                nonce: trulybot_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    showMessage('success', response.data);
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                } else {
                    showMessage('error', response.data);
                    $btn.prop('disabled', false).text('Disconnect');
                }
            },
            error: function(xhr, status, error) {
                showMessage('error', 'Disconnection failed: ' + error);
                $btn.prop('disabled', false).text('Disconnect');
            }
        });
    });
    
    // Test connection button handler
    $('#test-connection-btn').on('click', function(e) {
        e.preventDefault();
        
        const $btn = $(this);
        $btn.prop('disabled', true).text(trulybot_ajax.messages.testing);
        
        $.ajax({
            url: trulybot_ajax.ajaxurl,
            type: 'POST',
            data: {
                action: 'trulybot_test_connection',
                nonce: trulybot_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    showMessage('success', response.data);
                } else {
                    showMessage('error', response.data);
                }
                $btn.prop('disabled', false).text('Test Connection');
            },
            error: function(xhr, status, error) {
                showMessage('error', 'Test failed: ' + error);
                $btn.prop('disabled', false).text('Test Connection');
            }
        });
    });
    
    // Message display function
    function showMessage(type, message) {
        // Remove existing messages
        $('.trulybot-message').remove();
        
        const alertClass = type === 'success' ? 'notice-success' : 'notice-error';
        const iconClass = type === 'success' ? 'dashicons-yes-alt' : 'dashicons-warning';
        
        const messageHtml = `
            <div class="notice ${alertClass} trulybot-message" style="margin: 15px 0; padding: 10px;">
                <p>
                    <span class="dashicons ${iconClass}" style="margin-right: 5px;"></span>
                    ${message}
                </p>
            </div>
        `;
        
        $('.trulybot-admin-container').prepend(messageHtml);
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(function() {
                $('.trulybot-message').fadeOut();
            }, 5000);
        }
    }
    
    // Form validation
    $('#trulybot_user_id').on('input', function() {
        const value = $(this).val().trim();
        const $submitBtn = $('#connect-btn');
        
        if (value.length > 0) {
            $submitBtn.prop('disabled', false);
        } else {
            $submitBtn.prop('disabled', true);
        }
    });
    
    // Initialize form state
    const initialUserId = $('#trulybot_user_id').val();
    if (!initialUserId || initialUserId.trim() === '') {
        $('#connect-btn').prop('disabled', true);
    }
    
    // Preview functionality (if connected)
    if ($('#trulybot-preview-container').length > 0) {
        loadPreview();
    }
    
    function loadPreview() {
        // This would show a preview of how the chatbot looks
        const previewHtml = `
            <div class="trulybot-preview-widget" style="
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 20px;
                background: #f9f9f9;
                text-align: center;
                margin: 20px 0;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #2563EB;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                ">
                    💬
                </div>
                <h4 style="margin: 0 0 10px; color: #333;">TrulyBot Assistant</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Ready to help customers with order tracking and support
                </p>
                <div style="margin-top: 15px;">
                    <small style="color: #999;">
                        This is how your chatbot will appear on your store
                    </small>
                </div>
            </div>
        `;
        
        $('#trulybot-preview-container').html(previewHtml);
    }
});