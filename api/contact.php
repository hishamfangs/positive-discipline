<?php
require_once '../config/email-config.php';

// reCAPTCHA v3 configuration
define('RECAPTCHA_SECRET_KEY', '6LeiqTQsAAAAAB3GXYTRDzvtpDqiGAYe-k2hKTkI');
define('RECAPTCHA_SCORE_THRESHOLD', 0.5);

// Validate POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Verify reCAPTCHA token
$recaptchaToken = $_POST['recaptcha_token'] ?? '';
if (empty($recaptchaToken)) {
    jsonResponse(false, 'Security verification failed. Please try again.');
}

$recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
$recaptchaData = [
    'secret' => RECAPTCHA_SECRET_KEY,
    'response' => $recaptchaToken,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

$recaptchaOptions = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($recaptchaData)
    ]
];

$recaptchaContext = stream_context_create($recaptchaOptions);
$recaptchaResponse = @file_get_contents($recaptchaUrl, false, $recaptchaContext);

if ($recaptchaResponse === false) {
    error_log('reCAPTCHA verification request failed');
    jsonResponse(false, 'Security verification failed. Please try again.');
}

$recaptchaResult = json_decode($recaptchaResponse, true);

if (!$recaptchaResult['success'] || $recaptchaResult['score'] < RECAPTCHA_SCORE_THRESHOLD) {
    error_log('reCAPTCHA verification failed: ' . json_encode($recaptchaResult));
    jsonResponse(false, 'Security verification failed. Please try again.');
}

// Get and clean form data
$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');
$phone = clean($_POST['phone'] ?? '');

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    jsonResponse(false, 'Please fill in all required fields');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

// Compose admin notification using shared template (formal tone addressed to Nagwa)
$adminContent = "
<section style='background:#f2f5f9; border-left:4px solid #1f8a89; border-radius:12px; padding:24px; margin-bottom:26px;'>
    <h2 style='margin:0 0 12px 0; color:#16606a; font-size:22px;'>Nagwa, you have a new contact request</h2>
    <p style='margin:0; color:#41586c;'>A visitor submitted the contact form on Positive Discipline DXB.</p>
</section>

<table class='info-table'>
    <tr><th>Sender</th><td>{$name}</td></tr>
    <tr><th>Email</th><td><a href='mailto:{$email}' style='color: #1f8a89; text-decoration:none;'>{$email}</a></td></tr>
    " . ($phone ? "<tr><th>Phone</th><td>{$phone}</td></tr>" : "") . "
    <tr><th>Subject</th><td>" . ($subject ?: 'No subject provided') . "</td></tr>
    <tr><th>Received</th><td>" . date('F j, Y \a\t g:i A') . "</td></tr>
</table>

<section style='border:1px solid #d7e1ea; border-radius:12px; padding:22px;'>
    <h3 style='margin:0 0 14px 0; color:#1f3d55; font-size:18px;'>Message from {$name}</h3>
    <p style='white-space:pre-line; margin:0; color:#2f4052;'>" . nl2br($message) . "</p>
</section>

<p style='margin-top:20px; color:#4a6073;'>You can reply directly from this email or follow up via phone if provided.</p>
";

$adminEmail = wrapEmailContent('New Contact Message', $adminContent);
$adminSent = sendEmail('nagwa@positivedisciplinedxb.com', ($subject ? "Contact: {$subject}" : 'Contact form message'), $adminEmail);

if (!$adminSent) {
    error_log('Contact form admin email failed for nagwa@positivedisciplinedxb.com, retrying with ADMIN_EMAIL');
    $adminSent = sendEmail(ADMIN_EMAIL, ($subject ? "Contact: {$subject}" : 'Contact form message'), $adminEmail);
}

// Compose user confirmation using shared template (formal tone)
$userContent = "
<section style='background:#f4f6f8; border-left:4px solid #b7c2cc; border-radius:10px; padding:22px; margin-bottom:24px;'>
    <h2 style='margin:0 0 10px 0; color:#1f3d55; font-size:22px;'>Thank you, {$name}</h2>
    <p style='margin:0; color:#4d5c6b;'>Your message has been received. A member of our team will respond within the next 24 hours.</p>
</section>

<table class='info-table'>
    <tr><th>Subject</th><td>" . ($subject ?: 'No subject provided') . "</td></tr>
    <tr><th>Submitted</th><td>" . date('F j, Y \a\t g:i A') . "</td></tr>
</table>

<section style='border:1px solid #dde3ea; border-radius:10px; padding:20px;'>
    <h3 style='margin:0 0 12px 0; color:#1f3d55; font-size:18px;'>Copy of your message</h3>
    <p style='white-space:pre-line; margin:0; color:#3b4a5a;'>" . nl2br($message) . "</p>
</section>

<p style='margin-top:24px; color:#3b4a5a;'>Best regards,<br><strong>Positive Discipline DXB Team</strong></p>
";

$userEmail = wrapEmailContent('We received your message', $userContent);
$userSent = sendEmail($email, 'Message received - Positive Discipline DXB', $userEmail);

// Response
if ($adminSent && $userSent) {
    jsonResponse(true, 'Message sent successfully! We\'ll contact you soon.');
} else {
    jsonResponse(false, 'Error sending message. Please try again.');
}
?>