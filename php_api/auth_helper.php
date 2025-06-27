<?php
/**
 * Authentication Helper Functions
 * 
 * This file contains helper functions for authentication in the Jack Carden portfolio API.
 */

/**
 * Verify if the request has a valid authentication token
 * 
 * @return bool True if authenticated, false otherwise
 */
function isAuthenticated() {
    // Get authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Check if authorization header exists and has Bearer prefix
    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return false;
    }
    
    $token = $matches[1];
    
    // In a real-world application, you'd validate this token against a database
    // of issued tokens with expiration dates. For this simple implementation,
    // we'll just check that it's a non-empty string.
    return !empty($token) && strlen($token) >= 32; // At least 32 chars for security
}

/**
 * Require authentication for the current request
 * 
 * If not authenticated, this will terminate the script with a 401 response
 */
function requireAuthentication() {
    if (!isAuthenticated()) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit();
    }
}
?>
