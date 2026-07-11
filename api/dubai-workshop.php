<?php
require_once '../config/email-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get and clean data
$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$countryCode = clean($_POST['country_code'] ?? '+971');
$attendees = (int)($_POST['attendees'] ?? 1);
$date = clean($_POST['date'] ?? '');

// Validate
if (empty($name) || empty($email) || empty($phone)) {
    jsonResponse(false, 'Please fill in all required fields');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

// Workshop details
$workshopStatus = 'Dates to be announced – we will reach out as soon as the schedule is confirmed.';

// Admin notification email to Nagwa
$adminContent = "
<div class='highlight'>
    <h2>📩 New Dubai Workshop Interest Registration</h2>
    <p>A new contact has registered their interest for the upcoming Dubai workshop.</p>
</div>

<table class='info-table'>
    <tr><th>Full Name</th><td>{$name}</td></tr>
    <tr><th>Email Address</th><td><a href='mailto:{$email}' style='color: #1f8a89;'>{$email}</a></td></tr>
    <tr><th>Phone Number</th><td>{$countryCode} {$phone}</td></tr>
    <tr><th>Attendees Interested</th><td>{$attendees} " . ($attendees > 1 ? 'people' : 'person') . "</td></tr>
    <tr><th>Workshop Status</th><td>{$workshopStatus}</td></tr>
    <tr><th>Submitted</th><td>" . date('F j, Y \a\t g:i A') . "</td></tr>
    <tr><th>Preferred Date</th><td>{$date}</td></tr>
</table>

<div class='highlight'>
    <h3>Suggested Follow-up:</h3>
    <p>📞 Reach out to confirm their interest<br>
    🗓 Share tentative dates once available<br>
    📨 Add them to the Dubai interest mailing list</p>
</div>

<p><em>This submission came through the Dubai workshop interest form.</em></p>
";

// User confirmation email
$userContent = "
<div class='highlight'>
    <h2>🙏 Thank you for your interest!</h2>
    <p>Hello {$name}, your interest in our upcoming Dubai workshop has been registered.</p>
</div>

<h3>What you can expect next:</h3>
<table class='info-table'>
    <tr><th>Workshop</th><td>Dubai Positive Discipline Workshop</td></tr>
    <tr><th>Attendees Registered</th><td>{$attendees} " . ($attendees > 1 ? 'people' : 'person') . "</td></tr>
    <tr><th>Status</th><td>{$workshopStatus}</td></tr>
    <tr><th>Preferred Date</th><td>{$date}</td></tr>
</table>

<div class='highlight'>
    <h3>Next Steps</h3>
    <p>📬 We'll send you the confirmed date, time, and location as soon as they are finalized.</p>
    <p>🤝 You'll also be the first to know when early registration opens.</p>
</div>

<p>We're excited to have you on this journey towards kinder, firmer parenting. We'll be in touch very soon!</p>

<p>Warm regards,<br>
<strong>Positive Discipline DXB Team</strong></p>
";

// Send emails using shared template
$adminEmail = wrapEmailContent('New Dubai Workshop Interest Registration', $adminContent);
$userEmail = wrapEmailContent('Thanks for Registering Your Interest', $userContent);

$adminSent = sendEmail('nagwa@positivedisciplinedxb.com', "Dubai Workshop Interest - {$name}", $adminEmail);
if (!$adminSent) {
    error_log('Dubai workshop admin email failed for nagwa@positivedisciplinedxb.com, retrying with ADMIN_EMAIL');
    $adminSent = sendEmail(ADMIN_EMAIL, "Dubai Workshop Interest - {$name}", $adminEmail);
}

$userSent = sendEmail($email, "Thanks for Registering Your Interest", $userEmail);

if ($userSent) {
    jsonResponse(true, 'Thanks for registering your interest! We will be in touch soon.');
}

jsonResponse(false, 'Interest received. We will contact you directly.');
?>