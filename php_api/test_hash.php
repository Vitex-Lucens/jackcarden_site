<?php
header('Content-Type: application/json');

$password = "admin123";
$hash = '$2y$10$1WFOQYDlbFatVhLuIKIODeEJRhiHkWlW1f.dIUg2hN54EHQq1znDa';

// Check if the stored hash matches the password
$isValid = password_verify($password, $hash);

// Generate a new hash for the password for comparison
$newHash = password_hash($password, PASSWORD_BCRYPT);

// Output debug info
$result = [
    'password' => $password,
    'stored_hash' => $hash,
    'new_hash' => $newHash,
    'is_valid' => $isValid,
    'php_version' => PHP_VERSION,
    'bcrypt_available' => defined('PASSWORD_BCRYPT')
];

echo json_encode($result, JSON_PRETTY_PRINT);
?>
