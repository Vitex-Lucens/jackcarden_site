<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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

try {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $galleryData = json_decode($rawData, true);
    
    // Validate that we have the required data
    if (!$galleryData || !isset($galleryData['works']) || !is_array($galleryData['works'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid gallery data format']);
        exit;
    }
    
    // Create the path to the gallery.json file
    $filePath = dirname(__DIR__) . '/data/gallery.json';
    
    // Ensure data directory exists
    $dataDir = dirname(__DIR__) . '/data';
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Write the updated gallery data to the file
    $result = file_put_contents(
        $filePath, 
        json_encode(['works' => $galleryData['works']], JSON_PRETTY_PRINT),
        LOCK_EX
    );
    
    if ($result === false) {
        throw new Exception('Failed to write gallery data to file');
    }
    
    echo json_encode(['success' => true, 'message' => 'Gallery data saved successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save gallery data: ' . $e->getMessage()]);
}
?>
