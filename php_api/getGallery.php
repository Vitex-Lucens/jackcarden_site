<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Read the gallery JSON file
    $filePath = dirname(__DIR__) . '/data/gallery.json';
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Gallery data not found']);
        exit;
    }
    
    $fileContents = file_get_contents($filePath);
    
    // Check if the file was read successfully
    if ($fileContents === false) {
        throw new Exception('Unable to read file');
    }
    
    // Parse the JSON data
    $galleryData = json_decode($fileContents, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    // Return the data
    echo json_encode($galleryData);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error reading gallery data',
        'details' => $e->getMessage()
    ]);
}
?>
