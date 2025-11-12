<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple email configuration without SMTP
define('ADMIN_EMAIL', 'info@positivedisciplinedxb.com');
define('FROM_EMAIL', 'info@positivedisciplinedxb.com');
define('FROM_NAME', 'Positive Discipline DXB');

// Simple functions
function clean($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function jsonResponse($success, $message) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

function sendSimpleEmail($to, $subject, $message) {
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// Handle request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get and clean data
$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$countryCode = clean($_POST['country_code'] ?? '+20');
$attendees = (int)($_POST['attendees'] ?? 1);
$course = clean($_POST['date'] ?? '');

// Validate
if (empty($name) || empty($email) || empty($phone) || empty($course)) {
    jsonResponse(false, 'Please fill in all required fields');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

// Course details
$courseDetails = $course === 'weekdays' ? 
    'Weekdays: Mon & Wed Nov 24-Dec 3, 10am-1pm' : 
    'Weekends: Fri & Sat Nov 21-29, 9am-12pm';

$totalCost = number_format(10000 * $attendees) . ' EGP';

// Admin email
$adminMessage = "
<h2>New Egypt Workshop Registration</h2>
<p><strong>Name:</strong> {$name}</p>
<p><strong>Email:</strong> {$email}</p>
<p><strong>Phone:</strong> {$countryCode} {$phone}</p>
<p><strong>Course:</strong> {$courseDetails}</p>
<p><strong>Attendees:</strong> {$attendees}</p>
<p><strong>Total Cost:</strong> {$totalCost}</p>
<p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>
";

// User confirmation
$userMessage = "
<h2>Registration Confirmed!</h2>
<p>Thank you {$name} for registering for our Egypt Workshop.</p>
<p><strong>Course:</strong> {$courseDetails}</p>
<p><strong>Attendees:</strong> {$attendees}</p>
<p><strong>Total:</strong> {$totalCost}</p>
<p>We'll contact you within 24 hours with payment details and next steps.</p>
<hr>
<p>Best regards,<br>Nagwa El Saadani<br>Positive Discipline DXB</p>
";

// Send emails
$adminSent = sendSimpleEmail(ADMIN_EMAIL, "Egypt Workshop Registration - {$name}", $adminMessage);
$userSent = sendSimpleEmail($email, "Egypt Workshop Registration Confirmed", $userMessage);

if ($adminSent && $userSent) {
    jsonResponse(true, 'Registration successful! Check your email for confirmation.');
} else {
    jsonResponse(false, 'Registration received. We will contact you directly.');
}
?>