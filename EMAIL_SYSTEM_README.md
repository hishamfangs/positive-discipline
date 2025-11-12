# Positive Discipline DXB - Email System Documentation

## Overview
This website includes a complete email system for handling workshop registrations and contact form submissions. All forms send both admin notifications and user confirmation emails.

## System Components

### 1. Configuration
- **File**: `config/email-config.php`
- **Purpose**: Central configuration for email settings, templates, and utility functions
- **Key Functions**: 
  - `sendEmail()` - Main email sending function
  - `wrapEmailContent()` - HTML email template wrapper
  - `sanitizeInput()` - Input sanitization
  - `isValidEmail()` - Email validation

### 2. API Endpoints
All form handlers are located in the `api/` directory:

- **Egypt Workshop**: `api/egypt-workshop.php`
- **Dubai Workshop**: `api/dubai-workshop.php` 
- **School Workshop**: `api/school-workshop.php`
- **Contact Form**: `api/contact.php`
- **Test Configuration**: `api/test-email-config.php`

### 3. Frontend Integration
- **JavaScript**: `script.js` - Form submission handlers and validation
- **CSS**: `styles.css` - Form message styling and loading states

## Email Templates

### User Confirmation Emails
- Welcome message with booking details
- Next steps and what to expect
- Contact information for questions
- Links to social media

### Admin Notification Emails
- Complete submission details
- Action items and next steps
- Contact information for follow-up

## Form Types

### 1. Egypt Workshop Form
- **Fields**: Name, Phone, Email, Course Selection, Attendees
- **Pricing**: 24,000 EGP per person
- **Courses**: Weekdays or Weekends options

### 2. Dubai Workshop Form  
- **Fields**: Name, Phone, Email, Attendees
- **Type**: Free introductory workshop
- **Date**: December 6, 2024

### 3. School Workshop Form
- **Fields**: Name, Phone, Email, School Name, Position, Expected Parents, Preferred Date, Additional Info
- **Type**: Custom school partnerships

### 4. Contact Form
- **Fields**: Name, Email, Phone (optional), Subject, Message
- **Purpose**: General inquiries and support

## Setup Instructions

### 1. Server Requirements
- PHP 7.0 or higher
- Working `mail()` function OR configured SMTP
- Web server (Apache/Nginx) with mod_rewrite

### 2. Configuration Steps
1. Update email addresses in `config/email-config.php`
2. Test email configuration using `api/test-email-config.php`
3. Ensure proper file permissions on the config directory
4. Verify CORS headers are working for frontend integration

### 3. Testing
1. Visit `/api/test-email-config.php` to verify configuration
2. Test form submissions through the website
3. Check email delivery to both admin and user addresses

## Security Features

### Input Validation
- All inputs are sanitized using `htmlspecialchars()`
- Email addresses are validated with `filter_var()`
- Required field validation on both frontend and backend

### CORS Protection
- Configured to allow requests from the website domain
- Preflight request handling for cross-origin submissions

### Error Handling
- Graceful failure with user-friendly messages
- Server-side logging of errors
- Fallback messaging when email delivery fails

## Customization

### Email Templates
Edit the email content in each form handler file:
- User confirmation emails focus on welcome and next steps
- Admin notification emails emphasize action items

### Styling
Form messages and loading states can be customized in `styles.css`:
- Success/error message colors and animations
- Loading spinner styles for submit buttons

### Pricing
Update pricing calculations in the respective form handlers and `script.js` price calculator functions.

## Troubleshooting

### Email Not Sending
1. Check server mail configuration
2. Verify `mail()` function is available
3. Check server error logs
4. Test with `api/test-email-config.php`

### Form Submissions Failing
1. Check browser console for JavaScript errors
2. Verify CORS headers are working
3. Check network tab for failed requests
4. Ensure form IDs match JavaScript handlers

### Styling Issues
1. Clear browser cache
2. Check for CSS conflicts
3. Verify form message classes are applied correctly

## Support
For technical issues with the email system, check:
1. Server error logs
2. Browser developer tools
3. Form handler responses in network tab
4. Email delivery logs (if available)