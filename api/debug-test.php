<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple test to check if basic PHP is working
echo "PHP is working!\n";

// Test if we can load the config
try {
    require_once '../config/email-config.php';
    echo "Config loaded successfully!\n";
} catch (Exception $e) {
    echo "Config error: " . $e->getMessage() . "\n";
    exit;
}

// Test if constants are defined
echo "ADMIN_EMAIL: " . (defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'NOT DEFINED') . "\n";
echo "FROM_EMAIL: " . (defined('FROM_EMAIL') ? FROM_EMAIL : 'NOT DEFINED') . "\n";

// Test if functions exist
echo "sendEmail function exists: " . (function_exists('sendEmail') ? 'YES' : 'NO') . "\n";
echo "clean function exists: " . (function_exists('clean') ? 'YES' : 'NO') . "\n";
echo "jsonResponse function exists: " . (function_exists('jsonResponse') ? 'YES' : 'NO') . "\n";

// Test POST data (if any)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "POST data received:\n";
    print_r($_POST);
} else {
    echo "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n";
}

// Test a simple email send (uncomment to test)
/*
if (isset($_GET['test_email'])) {
    $result = sendEmail('test@example.com', 'Test Subject', 'Test message');
    echo "Email test result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
}
*/

echo "\nTest completed successfully!";
?>