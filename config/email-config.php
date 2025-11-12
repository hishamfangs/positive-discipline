<?php
// Email Configuration
define('ADMIN_EMAIL', 'info@positivedisciplinedxb.com');
define('FROM_EMAIL', 'info@positivedisciplinedxb.com');
define('FROM_NAME', 'Positive Discipline DXB');

// SMTP Configuration - Titan Email
define('SMTP_HOST', 'smtp.titan.email');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'info@positivedisciplinedxb.com');
define('SMTP_PASSWORD', 'Kreidekreis2601!');
define('SMTP_ENCRYPTION', 'tls');

/**
 * Main email sending function with SMTP and fallback
 */
function sendEmail($to, $subject, $message, $fromName = FROM_NAME) {
    // First try SMTP
    if (sendEmailSMTP($to, $subject, $message, $fromName)) {
        return true;
    }
    
    // Fallback to basic mail() function
    error_log("SMTP failed, using fallback mail() function");
    return sendEmailFallback($to, $subject, $message, $fromName);
}

/**
 * SMTP email sending function
 */
function sendEmailSMTP($to, $subject, $message, $fromName = FROM_NAME) {
    try {
        // Connect to SMTP server
        $connection = fsockopen(SMTP_HOST, SMTP_PORT, $errno, $errstr, 30);
        if (!$connection) {
            error_log("SMTP connection failed: $errno $errstr");
            return false;
        }

        // Read server greeting
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '220') {
            error_log("SMTP server not ready: $response");
            fclose($connection);
            return false;
        }

        // Send EHLO
        $hostname = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'positivedisciplinedxb.com';
        fputs($connection, "EHLO $hostname\r\n");
        $response = fgets($connection, 515);

        // Start TLS
        if (SMTP_ENCRYPTION == 'tls') {
            fputs($connection, "STARTTLS\r\n");
            $response = fgets($connection, 515);
            if (substr($response, 0, 3) != '220') {
                error_log("STARTTLS failed: $response");
                fclose($connection);
                return false;
            }
            
            // Enable TLS encryption
            stream_socket_enable_crypto($connection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            
            // Send EHLO again after TLS
            fputs($connection, "EHLO $hostname\r\n");
            $response = fgets($connection, 515);
        }

        // Authenticate
        fputs($connection, "AUTH LOGIN\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '334') {
            error_log("AUTH LOGIN failed: $response");
            fclose($connection);
            return false;
        }

        // Send username
        fputs($connection, base64_encode(SMTP_USERNAME) . "\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '334') {
            error_log("Username auth failed: $response");
            fclose($connection);
            return false;
        }

        // Send password
        fputs($connection, base64_encode(SMTP_PASSWORD) . "\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '235') {
            error_log("Password auth failed: $response");
            fclose($connection);
            return false;
        }

        // Send MAIL FROM
        fputs($connection, "MAIL FROM: <" . FROM_EMAIL . ">\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '250') {
            error_log("MAIL FROM failed: $response");
            fclose($connection);
            return false;
        }

        // Send RCPT TO
        fputs($connection, "RCPT TO: <$to>\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '250') {
            error_log("RCPT TO failed: $response");
            fclose($connection);
            return false;
        }

        // Send DATA
        fputs($connection, "DATA\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '354') {
            error_log("DATA command failed: $response");
            fclose($connection);
            return false;
        }

        // Send headers and message
        $headers = "From: $fromName <" . FROM_EMAIL . ">\r\n";
        $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "\r\n";

        fputs($connection, $headers . $message . "\r\n.\r\n");
        $response = fgets($connection, 515);
        if (substr($response, 0, 3) != '250') {
            error_log("Message send failed: $response");
            fclose($connection);
            return false;
        }

        // Send QUIT
        fputs($connection, "QUIT\r\n");
        fclose($connection);

        return true;

    } catch (Exception $e) {
        error_log("SMTP Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Fallback email function using basic mail()
 */
function sendEmailFallback($to, $subject, $message, $fromName = FROM_NAME) {
    $headers = array();
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "From: $fromName <" . FROM_EMAIL . ">";
    $headers[] = "Reply-To: " . FROM_EMAIL;
    
    $headerString = implode("\r\n", $headers);
    
    return mail($to, $subject, $message, $headerString);
}

/**
 * Input sanitization
 */
function clean($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Email validation
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * JSON response helper
 */
function jsonResponse($success, $message) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}



/**
 * Email template wrapper with logo and enhanced styling
 */
function wrapEmailContent($title, $content) {
    $logoUrl = 'https://positivedisciplinedxb.com/new/assets/logo.png';
    
    return "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>{$title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #264653; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(31, 138, 137, 0.15); }
            .header { background: none; color: black; padding: 32px 24px; text-align: center; }
            .logo { max-width: 100%; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 600; letter-spacing: 0.5px; }
            .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 18px; }
            .content { padding: 32px 26px; background-color: #ffffff; }
            .footer { background: #f1f3f4; padding: 22px 26px; text-align: center; font-size: 14px; color: #666; }
            .highlight { background-color: #e8f8f6; padding: 22px; border-radius: 10px; margin: 22px 0; border-left: 5px solid #1f8a89; }
            .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #fcfcfc; border-radius: 8px; overflow: hidden; }
            .info-table th, .info-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #e3e7ea; font-size: 15px; }
            .info-table th { background-color: #f1f5f9; font-weight: 600; color: #1f8a89; width: 38%; text-transform: uppercase; font-size: 13px; letter-spacing: 0.6px; }
            .info-table td { background-color: #ffffff; }
            .info-table tr:last-child th, .info-table tr:last-child td { border-bottom: none; }
            h2 { color: #1f8a89; margin: 0 0 12px 0; font-size: 22px; }
            h3 { color: #16606a; margin: 18px 0 10px 0; }
            p { margin: 0 0 12px 0; }
            a { color: #1f8a89; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <img src='{$logoUrl}' alt='Positive Discipline DXB Logo' class='logo'>

                <p>{$title}</p>
            </div>
            <div class='content'>
                {$content}
            </div>
            <div class='footer'>
                <p><strong>Positive Discipline DXB</strong></p>
                <p>Empowering families through kind and firm parenting</p>
                <p>Dubai, UAE & Cairo, Egypt</p>
                <p style='margin-top: 15px;'>
                    <a href='https://www.instagram.com/positivedisciplinedxb/'>Follow us on Instagram</a> | 
                    <a href='mailto:info@positivedisciplinedxb.com'>Contact Us</a>
                </p>
            </div>
        </div>
    </body>
    </html>";
}


?>