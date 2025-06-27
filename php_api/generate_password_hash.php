<?php
// This script generates a bcrypt hash for a new password
// Usage: Visit this page on your server and enter the new password

// Set content type
header('Content-Type: text/html');

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['new_password'])) {
    $newPassword = $_POST['new_password'];
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $message = "Hash for password: <code>$newHash</code>";
} else {
    $message = "";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Password Generator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="password"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }
        button {
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
        .result {
            margin-top: 20px;
            padding: 10px;
            background: #e9f7ef;
            border: 1px solid #ddd;
            word-break: break-all;
        }
        .instructions {
            margin-top: 20px;
            font-size: 0.9em;
        }
        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Admin Password Generator</h1>
        <p>Use this tool to generate a new bcrypt hash for your admin password.</p>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="new_password">New Password:</label>
                <input type="password" id="new_password" name="new_password" required>
            </div>
            <button type="submit">Generate Hash</button>
        </form>
        
        <?php if ($message): ?>
            <div class="result">
                <h3>Generated Hash:</h3>
                <p><?php echo $message; ?></p>
            </div>
            <div class="instructions">
                <h3>Next steps:</h3>
                <ol>
                    <li>Copy this hash</li>
                    <li>Open <code>php_api/verifyAdmin.php</code></li>
                    <li>Replace the existing hash with this new one</li>
                    <li>Rebuild and deploy the site</li>
                </ol>
            </div>
        <?php endif; ?>
        
        <div class="instructions">
            <h3>Security Note:</h3>
            <p>After you've changed the password, <strong>delete this file</strong> from your server for security.</p>
        </div>
    </div>
</body>
</html>
