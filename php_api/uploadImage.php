<?php
// Include authentication helper
require_once __DIR__ . '/auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Require authentication for this endpoint
requireAuthentication();

try {
    // Ensure uploads and images directories exist
    $uploadsDir = dirname(__DIR__) . '/uploads';
    $imagesDir = dirname(__DIR__) . '/images';
    
    if (!file_exists($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }
    
    if (!file_exists($imagesDir)) {
        mkdir($imagesDir, 0755, true);
    }
    
    // Check if image file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $error = isset($_FILES['image']) ? $_FILES['image']['error'] : 'No file uploaded';
        http_response_code(400);
        echo json_encode(['error' => 'No image file provided or upload error: ' . $error]);
        exit;
    }
    
    $file = $_FILES['image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed.']);
        exit;
    }
    
    // Generate a unique filename for the gallery
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $timestamp = time();
    $uniqueId = base_convert($timestamp, 10, 36) . substr(str_shuffle('abcdefghijklmnopqrstuvwxyz0123456789'), 0, 3);
    $fileName = "work-{$uniqueId}.{$fileExt}";
    $destPath = $imagesDir . '/' . $fileName;
    
    // Move the uploaded file
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new Exception('Failed to move uploaded file');
    }
    
    // Return success with relative path
    $relativePath = "/images/{$fileName}";
    echo json_encode([
        'success' => true,
        'filePath' => $relativePath
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to upload file: ' . $e->getMessage()
    ]);
}
?>
