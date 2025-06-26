<?php
// Set proper content type header
header('Content-Type: application/json');

// Allow all CORS origins for development - you may want to restrict this in production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Read the about.json file
$filePath = '../data/about.json';

try {
    if (!file_exists($filePath)) {
        throw new Exception("About data file not found");
    }
    
    $fileContents = file_get_contents($filePath);
    
    if ($fileContents === false) {
        throw new Exception("Failed to read about data file");
    }
    
    // Check if content is valid JSON
    $aboutData = json_decode($fileContents, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format in about data: " . json_last_error_msg());
    }
    
    // Return the data
    echo $fileContents;
    
} catch (Exception $e) {
    // Return error
    http_response_code(500);
    echo json_encode([
        'error' => 'Error reading about data',
        'details' => $e->getMessage()
    ]);
}
?>
