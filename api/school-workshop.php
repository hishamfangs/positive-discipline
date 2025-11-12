<?php
require_once '../config/email-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$requestType = clean($_POST['request_type'] ?? 'general');
$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$countryCode = clean($_POST['country_code'] ?? '+20');
$schoolName = clean($_POST['school_name'] ?? '');
$position = clean($_POST['position'] ?? '');
$expectedParents = clean($_POST['expected_parents'] ?? '');
$preferredDate = clean($_POST['preferred_date'] ?? '');
$additionalInfo = clean($_POST['additional_info'] ?? '');
$campus = clean($_POST['campus'] ?? '');
$focusArea = clean($_POST['focus_area'] ?? '');

if (empty($name) || empty($email) || empty($schoolName)) {
    jsonResponse(false, 'Please fill in all required fields');
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Please enter a valid email address');
}

$workshopLabel = 'School Workshop Request';
if ($requestType === 'intro') {
    $workshopLabel = '1-Hour Intro Workshop Request';
} elseif ($requestType === 'custom') {
    $workshopLabel = 'Custom School Workshop Inquiry';
}

$adminIntro = $requestType === 'intro'
    ? 'A school has requested the 1-hour introductory session through the website.'
    : 'A school has asked to explore a tailored Positive Discipline experience.';

$formattedPhone = trim($phone) !== '' ? trim($countryCode . ' ' . $phone) : 'Not provided';
$audienceSize = $expectedParents !== '' ? $expectedParents : 'Not provided';
$timeline = $preferredDate !== '' ? $preferredDate : 'Not specified';
$campusText = $campus !== '' ? $campus : 'Not specified';
$focusText = $focusArea !== '' ? $focusArea : 'Not specified';
$positionText = $position !== '' ? $position : 'Not provided';

$adminContent = "
<section style='background:#f1f7f8;border-left:4px solid #1f8a89;border-radius:12px;padding:24px;margin-bottom:26px;'>
    <h2 style='margin:0 0 12px 0;color:#16606a;font-size:22px;'>Nagwa, you have a new enquiry</h2>
    <p style='margin:0;color:#3f5566;'>{$adminIntro}</p>
</section>

<table class='info-table'>
    <tr><th>Workshop Type</th><td>{$workshopLabel}</td></tr>
    <tr><th>Contact Name</th><td>{$name}</td></tr>
    <tr><th>Role / Title</th><td>{$positionText}</td></tr>
    <tr><th>Email</th><td><a href='mailto:{$email}' style='color:#1f8a89;text-decoration:none;'>{$email}</a></td></tr>
    <tr><th>Phone</th><td>{$formattedPhone}</td></tr>
    <tr><th>School</th><td>{$schoolName}</td></tr>
    <tr><th>Campus / Location</th><td>{$campusText}</td></tr>
    <tr><th>Preferred Timeline</th><td>{$timeline}</td></tr>
    <tr><th>Expected Audience</th><td>{$audienceSize}</td></tr>
    <tr><th>Focus Areas</th><td>{$focusText}</td></tr>
    <tr><th>Received</th><td>" . date('F j, Y \a\t g:i A') . "</td></tr>
</table>
";

if ($additionalInfo !== '') {
    $adminContent .= "
<section style='border:1px solid #d7e1ea;border-radius:12px;padding:22px;margin-top:20px;'>
    <h3 style='margin:0 0 12px 0;color:#1f3d55;font-size:18px;'>Additional Information</h3>
    <p style='white-space:pre-line;margin:0;color:#2f4052;'>" . nl2br($additionalInfo) . "</p>
</section>
";
}

$userIntro = $requestType === 'intro'
    ? 'Thank you for booking our 1-hour introductory workshop. We will be in touch within 24 hours to coordinate the session with you.'
    : 'Thank you for reaching out about a Positive Discipline workshop. We will connect within 24 hours to discuss a tailored plan for your community.';

$userContent = "
<section style='background:#f4f6f8;border-left:4px solid #b7c2cc;border-radius:12px;padding:22px;margin-bottom:24px;'>
    <h2 style='margin:0 0 10px 0;color:#1f3d55;font-size:22px;'>Thank you, {$name}</h2>
    <p style='margin:0;color:#4d5c6b;'>{$userIntro}</p>
</section>

<table class='info-table'>
    <tr><th>Workshop Type</th><td>{$workshopLabel}</td></tr>
    <tr><th>School</th><td>{$schoolName}</td></tr>
    <tr><th>Preferred Timeline</th><td>{$timeline}</td></tr>
    <tr><th>Expected Audience</th><td>{$audienceSize}</td></tr>
</table>
";

if ($additionalInfo !== '') {
    $userContent .= "
<section style='border:1px solid #dde3ea;border-radius:10px;padding:20px;'>
    <h3 style='margin:0 0 12px 0;color:#1f3d55;font-size:18px;'>You shared</h3>
    <p style='white-space:pre-line;margin:0;color:#3b4a5a;'>" . nl2br($additionalInfo) . "</p>
</section>
";
}

$userContent .= "
<p style='margin-top:24px;color:#3b4a5a;'>We look forward to partnering with you.<br><strong>Positive Discipline DXB Team</strong></p>
";

$adminEmailBody = wrapEmailContent($workshopLabel, $adminContent);
$userEmailBody = wrapEmailContent('We received your workshop request', $userContent);

$adminSent = sendEmail('nagwa@positivedisciplinedxb.com', "{$workshopLabel} - {$schoolName}", $adminEmailBody);
if (!$adminSent) {
    error_log('School workshop admin email failed for nagwa@positivedisciplinedxb.com, retrying with ADMIN_EMAIL');
    $adminSent = sendEmail(ADMIN_EMAIL, "{$workshopLabel} - {$schoolName}", $adminEmailBody);
}

$userSent = sendEmail($email, 'We received your Positive Discipline request', $userEmailBody);

if ($userSent) {
    jsonResponse(true, 'Request submitted successfully! We\'ll contact you within 24 hours.');
}

jsonResponse(false, 'Request received. We will contact you directly.');
