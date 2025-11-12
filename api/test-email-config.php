<?php
// Test Email Configuration
require_once '../config/email-config.php';

// Set content type for HTML display
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>Email Configuration Test</h1>";

// Test 1: Configuration Check
echo "<h2>1. Configuration Check</h2>";
echo "<p><strong>Admin Email:</strong> " . ADMIN_EMAIL . "</p>";
echo "<p><strong>From Email:</strong> " . FROM_EMAIL . "</p>";
echo "<p><strong>From Name:</strong> " . FROM_NAME . "</p>";
echo "<p><strong>Site Name:</strong> " . SITE_NAME . "</p>";
echo "<p><strong>Site URL:</strong> " . SITE_URL . "</p>";
echo "<p><strong>Email System:</strong> Simple PHP mail() function</p>";

// Test 2: Email Validation
echo "<h2>2. Email Validation Test</h2>";
$testEmails = [
    'valid@example.com' => 'Should be valid',
    'invalid.email' => 'Should be invalid',
    'test@domain' => 'Should be invalid',
    'user@domain.com' => 'Should be valid'
];

foreach ($testEmails as $email => $expected) {
    $isValid = isValidEmail($email) ? 'VALID' : 'INVALID';
    echo "<p><code>{$email}</code> - {$isValid} ({$expected})</p>";
}

// Test 3: Input Sanitization
echo "<h2>3. Input Sanitization Test</h2>";
$testInputs = [
    '<script>alert("xss")</script>Hello' => 'XSS attempt',
    'Normal text' => 'Clean text',
    'Text with "quotes" and \'apostrophes\'' => 'Quotes test'
];

foreach ($testInputs as $input => $description) {
    $sanitized = sanitizeInput($input);
    echo "<p><strong>{$description}:</strong><br>";
    echo "Original: <code>" . htmlspecialchars($input) . "</code><br>";
    echo "Sanitized: <code>" . htmlspecialchars($sanitized) . "</code></p>";
}

// Test 4: Email Template Generation
echo "<h2>4. Email Template Test</h2>";
$testContent = "
<h3>This is a test email</h3>
<p>Testing the email wrapper with some sample content.</p>
<ul>
    <li>List item 1</li>
    <li>List item 2</li>
</ul>
";

$wrappedEmail = wrapEmailContent('Test Email Subject', $testContent);
echo "<h4>User Email Template (Preview):</h4>";
echo "<div style='border: 1px solid #ccc; padding: 10px; background: #f9f9f9;'>";
echo "<pre style='white-space: pre-wrap; font-size: 12px;'>" . htmlspecialchars($wrappedEmail) . "</pre>";
echo "</div>";

$adminEmail = wrapEmailContent('Admin Test Subject', $testContent, true);
echo "<h4>Admin Email Template (Preview):</h4>";
echo "<div style='border: 1px solid #ccc; padding: 10px; background: #f9f9f9;'>";
echo "<pre style='white-space: pre-wrap; font-size: 12px;'>" . htmlspecialchars($adminEmail) . "</pre>";
echo "</div>";

// Test 5: Test Email Send (uncomment to test actual sending)
echo "<h2>5. Email Send Test</h2>";
echo "<p><strong>Note:</strong> Email sending test is disabled by default to prevent spam.</p>";
echo "<p>To test actual email sending, uncomment the code below and ensure your server has mail() function configured.</p>";

/*
// Uncomment this section to test actual email sending
echo "<h4>Attempting to send test email...</h4>";

$testEmailContent = wrapEmailContent(
    'Test Email from Positive Discipline DXB',
    "<h3>Test Email</h3><p>This is a test email from the Positive Discipline DXB website system.</p><p>If you receive this, the email configuration is working correctly!</p>"
);

$emailSent = sendEmail(
    ADMIN_EMAIL, // Send to admin email
    'Test Email - Positive Discipline DXB System Check',
    $testEmailContent
);

if ($emailSent) {
    echo "<p style='color: green;'><strong>✓ Email sent successfully!</strong></p>";
    echo "<p>Check the inbox for: " . ADMIN_EMAIL . "</p>";
} else {
    echo "<p style='color: red;'><strong>✗ Email sending failed.</strong></p>";
    echo "<p>Check your server's mail configuration and error logs.</p>";
}
*/

// Test 6: JSON Response Test
echo "<h2>6. JSON Response Test</h2>";
echo "<h4>Success Response:</h4>";
ob_start();
jsonResponse(true, 'Test success message');
$successResponse = ob_get_clean();
echo "<pre>" . htmlspecialchars($successResponse) . "</pre>";

echo "<h4>Error Response:</h4>";
ob_start();
jsonResponse(false, 'Test error message');
$errorResponse = ob_get_clean();
echo "<pre>" . htmlspecialchars($errorResponse) . "</pre>";

echo "<h2>Configuration Test Complete</h2>";
echo "<p>If all tests show expected results, your email system should be working correctly.</p>";
?>