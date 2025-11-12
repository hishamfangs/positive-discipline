<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../config/email-config.php';

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

// Admin notification email to Nagwa
$adminContent = "
<div class='highlight'>
    <h2>🎉 New Egypt Workshop Registration</h2>
    <p>A new participant has registered for the Egypt workshop through the website!</p>
</div>

<table class='info-table'>
    <tr><th>Participant Name</th><td>{$name}</td></tr>
    <tr><th>Email Address</th><td><a href='mailto:{$email}' style='color: #1f8a89;'>{$email}</a></td></tr>
    <tr><th>Phone Number</th><td>{$countryCode} {$phone}</td></tr>
    <tr><th>Selected Course</th><td>{$courseDetails}</td></tr>
    <tr><th>Number of Attendees</th><td>{$attendees} " . ($attendees > 1 ? 'people' : 'person') . "</td></tr>
    <tr><th>Total Cost</th><td><strong>{$totalCost}</strong></td></tr>
    <tr><th>Registration Date</th><td>" . date('F j, Y \a\t g:i A') . "</td></tr>
</table>

<div class='highlight'>
    <h3>Next Steps:</h3>
    <p>✅ Send payment details to the participant<br>
    ✅ Add them to the course WhatsApp group<br>
    ✅ Send course materials and location details</p>
</div>

<p><em>This registration was submitted through the website contact form.</em></p>
";

// User confirmation email
$userContent = "
<div class='highlight'>
    <h2>🎉 Registration Confirmed!</h2>
    <p>Thank you <strong>{$name}</strong> for registering for our Egypt Workshop!</p>
</div>

<h3>Your Registration Details:</h3>
<table class='info-table'>
    <tr><th>Course</th><td>{$courseDetails}</td></tr>
    <tr><th>Attendees</th><td>{$attendees} " . ($attendees > 1 ? 'people' : 'person') . "</td></tr>
    <tr><th>Total Cost</th><td><strong>{$totalCost}</strong></td></tr>
</table>

<div class='highlight'>
    <h3>What's Next?</h3>
    <p>📞 <strong>We'll contact you within 24 hours</strong> with payment details and next steps</p>
    <p>📍 Course location and materials will be shared once payment is confirmed</p>
    <p>📱 You'll be added to our course WhatsApp group for updates</p>
</div>

<p>We're excited to have you join us for this transformative parenting journey!</p>

<p>Best regards,<br>
<strong>Nagwa El Saadani</strong><br>
Positive Discipline DXB</p>
";

// Send emails with templates
$adminEmail = wrapEmailContent('New Egypt Workshop Registration', $adminContent);
$userEmail = wrapEmailContent('Registration Confirmed - Egypt Workshop', $userContent);

// Try sending admin email to Nagwa first, fall back to main inbox if needed
$adminSent = sendEmail('nagwa@positivedisciplinedxb.com', "New Egypt Workshop Registration - {$name}", $adminEmail);
if (!$adminSent) {
    error_log('Egypt workshop admin email failed for nagwa@positivedisciplinedxb.com, retrying with ADMIN_EMAIL');
    $adminSent = sendEmail(ADMIN_EMAIL, "New Egypt Workshop Registration - {$name}", $adminEmail);
}

// Always attempt user confirmation
$userSent = sendEmail($email, "Egypt Workshop Registration Confirmed", $userEmail);

if ($userSent) {
    jsonResponse(true, 'Registration successful! Check your email for confirmation.');
}

jsonResponse(false, 'Registration received. We will contact you directly.');
?>