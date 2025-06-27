<?php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// Respond to preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Verify we received data
if ($data === null || !isset($data['password'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit();
}

// Load password hash from secure file (outside web root)
// For this example, we'll include it in this file but in production
// it should be in a separate file outside web root
$validPasswordHash = '$2y$10$tBpLGM07VVHg8qbnM8QSxuYvTLXxmY5NXHX7mR4LP7HQKulqQiceq'; // Hash for "admin123" generated on GreenGeeks server

// Verify password
if (password_verify($data['password'], $validPasswordHash)) {
    // Generate a random token for the session
    $token = bin2hex(random_bytes(32));
    
    // In a more advanced implementation, you'd store this token in a database
    // with an expiration time. For simplicity, we'll just return it.
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'message' => 'Login successful'
    ]);
} else {
    // Sleep to prevent timing attacks
    sleep(1);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
}
?>
