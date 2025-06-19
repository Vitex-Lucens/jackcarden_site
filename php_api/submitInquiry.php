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
    $data = json_decode($rawData, true);
    
    // Validate required fields
    if (!isset($data['email']) || !isset($data['firstName']) || !isset($data['lastName'])) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields: email, firstName, and lastName are required'
        ]);
        exit;
    }
    
    // You'll need to configure these values with your actual SendinBlue/Brevo API key
    $apiKey = getenv('SENDINBLUE_API_KEY');
    
    // If API key is available, send to SendinBlue/Brevo
    if ($apiKey) {
        $url = 'https://api.sendinblue.com/v3/contacts';
        
        $payload = [
            'email' => $data['email'],
            'attributes' => [
                'FIRSTNAME' => $data['firstName'],
                'LASTNAME' => $data['lastName'],
                'PHONE' => $data['phone'] ?? '',
                'MESSAGE' => $data['message'] ?? ''
            ],
            'listIds' => [2], // Update this with your actual list ID
            'updateEnabled' => true
        ];
        
        // Initialize cURL
        $ch = curl_init($url);
        
        // Set cURL options
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'api-key: ' . $apiKey
        ]);
        
        // Execute cURL request
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        // Close cURL connection
        curl_close($ch);
        
        if ($httpCode >= 400) {
            // Log the error but continue to provide good user experience
            error_log('SendinBlue API error: ' . $response);
        }
    } else {
        // Store inquiries in a file if API key not available
        $inquiriesFile = dirname(__DIR__) . '/data/inquiries.json';
        
        // Create or read existing inquiries
        if (file_exists($inquiriesFile)) {
            $inquiries = json_decode(file_get_contents($inquiriesFile), true);
        } else {
            $inquiries = ['inquiries' => []];
        }
        
        // Add new inquiry with timestamp
        $data['timestamp'] = date('Y-m-d H:i:s');
        $inquiries['inquiries'][] = $data;
        
        // Ensure data directory exists
        $dataDir = dirname(__DIR__) . '/data';
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        // Save to file
        file_put_contents(
            $inquiriesFile,
            json_encode($inquiries, JSON_PRETTY_PRINT),
            LOCK_EX
        );
        
        // Optionally send an email notification
        $to = "your-email@example.com"; // Update this with your actual email
        $subject = "New Website Inquiry";
        $message = "Name: {$data['firstName']} {$data['lastName']}\n";
        $message .= "Email: {$data['email']}\n";
        
        if (isset($data['phone'])) {
            $message .= "Phone: {$data['phone']}\n";
        }
        
        if (isset($data['message'])) {
            $message .= "Message: {$data['message']}\n";
        }
        
        $headers = "From: website@" . $_SERVER['HTTP_HOST'];
        
        // Uncomment this line to enable email sending
        // mail($to, $subject, $message, $headers);
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your inquiry. We will be in touch soon.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to process form submission',
        'message' => 'There was a problem submitting your inquiry. Please try again later.'
    ]);
}
?>
