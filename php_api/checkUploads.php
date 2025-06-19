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
    // Path to uploads directory
    $uploadsDir = dirname(__DIR__) . '/uploads';
    
    // Check if directory exists
    if (!file_exists($uploadsDir)) {
        echo json_encode([
            'exists' => false,
            'files' => [],
            'error' => 'Uploads directory does not exist'
        ]);
        exit;
    }
    
    // Read directory
    $files = array_diff(scandir($uploadsDir), ['.', '..']);
    
    // Return list of files (convert to array of filenames)
    $fileList = [];
    foreach ($files as $file) {
        if (is_file($uploadsDir . '/' . $file)) {
            $fileList[] = $file;
        }
    }
    
    // Return the response
    echo json_encode([
        'exists' => true,
        'files' => $fileList
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error checking uploads directory: ' . $e->getMessage()
    ]);
}
?>
