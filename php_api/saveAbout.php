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
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $aboutData = json_decode($rawData, true);
    
    // Validate the data structure
    if (!$aboutData || !is_array($aboutData)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid data format'
        ]);
        exit;
    }
    
    // Ensure the data folder exists
    $dataDir = dirname(__DIR__) . '/data';
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Write the updated about data to the file
    $filePath = $dataDir . '/about.json';
    $result = file_put_contents(
        $filePath,
        json_encode($aboutData, JSON_PRETTY_PRINT),
        LOCK_EX
    );
    
    if ($result === false) {
        throw new Exception('Failed to write about data to file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'About data saved successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving about data: ' . $e->getMessage()
    ]);
}
?>
