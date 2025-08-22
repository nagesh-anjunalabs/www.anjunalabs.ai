const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({ region: 'us-west-1' });

// Rate limiting store (in production, use DynamoDB or Redis)
const rateLimitStore = new Map();

// Rate limiting function
function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5; // 5 requests per minute
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, []);
    }
    
    const requests = rateLimitStore.get(ip);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
        return true;
    }
    
    validRequests.push(now);
    rateLimitStore.set(ip, validRequests);
    return false;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://www.anjunalabs.ai',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        // Get client IP for rate limiting
        const clientIP = event.requestContext?.identity?.sourceIp || 'unknown';
        
        // Check rate limiting
        if (isRateLimited(clientIP)) {
            return {
                statusCode: 429,
                headers: {
                    'Access-Control-Allow-Origin': 'https://www.anjunalabs.ai',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
            };
        }

        // Parse and validate the form data
        const body = JSON.parse(event.body);
        const { email, company } = body;

        if (!email || !isValidEmail(email)) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': 'https://www.anjunalabs.ai',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Valid email is required' })
            };
        }

        // Sanitize inputs
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedCompany = company ? company.trim().substring(0, 100) : 'Not provided';

        // Send notification email to nagesh@anjunalabs.ai
        const emailParams = {
            Source: 'nagesh@anjunalabs.ai',
            Destination: {
                ToAddresses: ['nagesh@anjunalabs.ai']
            },
            Message: {
                Subject: {
                    Data: 'Website Inbound Waitlist'
                },
                Body: {
                    Text: {
                        Data: `New waitlist signup:

Email: ${sanitizedEmail}
Company: ${sanitizedCompany}
IP: ${clientIP}

Signed up from: www.anjunalabs.ai
Timestamp: ${new Date().toISOString()}`
                    },
                    Html: {
                        Data: `
                        <h2>New Waitlist Signup</h2>
                        <p><strong>Email:</strong> ${sanitizedEmail}</p>
                        <p><strong>Company:</strong> ${sanitizedCompany}</p>
                        <p><strong>IP:</strong> ${clientIP}</p>
                        <hr>
                        <p><small>Signed up from: www.anjunalabs.ai<br>
                        Timestamp: ${new Date().toISOString()}</small></p>
                        `
                    }
                }
            }
        };

        const command = new SendEmailCommand(emailParams);
        await sesClient.send(command);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://www.anjunalabs.ai',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Successfully joined waitlist' 
            })
        };

    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://www.anjunalabs.ai',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Failed to join waitlist'
            })
        };
    }
};