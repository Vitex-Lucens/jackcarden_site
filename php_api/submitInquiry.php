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
    
    // Log the received data for debugging
    error_log('Form submission data: ' . print_r($data, true));
    
    // You'll need to configure these values with your actual SendinBlue/Brevo API key
    $apiKey = getenv('SENDINBLUE_API_KEY');
    
    // If API key is available, send to SendinBlue/Brevo
    if ($apiKey) {
        $url = 'https://api.sendinblue.com/v3/contacts';
        
        // Create additional attributes from form data
        $additionalAttributes = [];
        
        // Add form data fields if they exist
        if (isset($data['formData'])) {
            if (isset($data['formData']['collectionExperience'])) {
                $additionalAttributes['COLLECTION_EXPERIENCE'] = $data['formData']['collectionExperience'];
            }
            
            if (isset($data['formData']['inquiryType'])) {
                $additionalAttributes['INQUIRY_TYPE'] = $data['formData']['inquiryType'];
            }
            
            if (isset($data['formData']['collectionTier'])) {
                $additionalAttributes['COLLECTION_TIER'] = $data['formData']['collectionTier'];
            }
            
            // Handle array fields
            if (isset($data['formData']['acquisitionGoals']) && is_array($data['formData']['acquisitionGoals'])) {
                $additionalAttributes['ACQUISITION_GOALS'] = implode(', ', $data['formData']['acquisitionGoals']);
            }
            
            if (isset($data['formData']['inquiryRoles']) && is_array($data['formData']['inquiryRoles'])) {
                $additionalAttributes['INQUIRY_ROLES'] = implode(', ', $data['formData']['inquiryRoles']);
            }
        }
        
        // Format for SendinBlue/Brevo
        $payload = [
            'email' => $data['email'],
            'attributes' => array_merge([
                'FIRSTNAME' => $data['firstName'],
                'LASTNAME' => $data['lastName'],
                'PHONE' => $data['phone'] ?? '',
                'MESSAGE' => $data['message'] ?? '',
                'SOURCE' => $data['source'] ?? 'website_acquisition_form',
                'CONSENT' => isset($data['consentGiven']) && $data['consentGiven'] ? 'Yes' : 'No',
            ], $additionalAttributes),
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
        
        // Add new inquiry with timestamp if not already set
        if (!isset($data['submittedAt'])) {
            $data['submittedAt'] = date('Y-m-d H:i:s');
        }
        
        // Clean up the data structure for storage
        $storageData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '',
            'message' => $data['message'] ?? '',
            'submittedAt' => $data['submittedAt'],
            'consentGiven' => isset($data['consentGiven']) ? (bool)$data['consentGiven'] : false,
            'source' => $data['source'] ?? 'website_acquisition_form'
        ];
        
        // Add form data if it exists
        if (isset($data['formData']) && is_array($data['formData'])) {
            $storageData['formData'] = $data['formData'];
        }
        
        $inquiries['inquiries'][] = $storageData;
        
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
        
        if (isset($data['phone']) && !empty($data['phone'])) {
            $message .= "Phone: {$data['phone']}\n";
        }
        
        if (isset($data['message']) && !empty($data['message'])) {
            $message .= "Message: {$data['message']}\n";
        }
        
        // Add form data to email
        if (isset($data['formData']) && is_array($data['formData'])) {
            $message .= "\n--- FORM RESPONSES ---\n";
            
            if (isset($data['formData']['collectionExperience'])) {
                $message .= "Collection Experience: {$data['formData']['collectionExperience']}\n";
            }
            
            if (isset($data['formData']['inquiryType'])) {
                $message .= "Inquiry Type: {$data['formData']['inquiryType']}\n";
            }
            
            if (isset($data['formData']['collectionTier'])) {
                $message .= "Collection Tier: {$data['formData']['collectionTier']}\n";
            }
            
            // Handle array fields
            if (isset($data['formData']['acquisitionGoals']) && is_array($data['formData']['acquisitionGoals'])) {
                $message .= "Acquisition Goals: " . implode(', ', $data['formData']['acquisitionGoals']) . "\n";
            }
            
            if (isset($data['formData']['inquiryRoles']) && is_array($data['formData']['inquiryRoles'])) {
                $message .= "Inquiry Roles: " . implode(', ', $data['formData']['inquiryRoles']) . "\n";
            }
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
