/**
 * Email template service - generates beautiful email templates
 */

/**
 * Generate password recovery email template
 * @param {string} recoveryLink - The recovery link
 * @param {string} locale - Language locale
 * @param {string} userFullName - Optional user's full name
 * @returns {object} Email template with subject, html, and text
 */
export function generatePasswordRecoveryTemplate(recoveryLink, locale = 'hu', userFullName = '') {
  const templates = {
    hu: {
      subject: 'Jelszó visszaállítás kérése',
      greeting: userFullName ? `Kedves ${userFullName}!` : 'Kedves Felhasználó!',
      title: 'Jelszó visszaállítás',
      description: 'Jelszó visszaállítási kérelmet kaptunk a fiókodhoz. Ha te voltál, kattints az alábbi gombra:',
      buttonText: 'Jelszó visszaállítása',
      expiryInfo: 'Ez a link 24 órán belül lejár.',
      notYou: 'Ha nem te kérted ezt a változtatást, kérjük hagyd figyelmen kívül ezt az emailt.',
      footer: 'Üdvözlettel,<br>Czakó Orsolya',
      footerNote: 'Ez egy automatikus email, kérjük ne válaszolj rá.'
    },
    en: {
      subject: 'Password Reset Request',
      greeting: userFullName ? `Dear ${userFullName}!` : 'Dear User!',
      title: 'Password Reset',
      description: 'We received a password reset request for your account. If this was you, click the button below:',
      buttonText: 'Reset Password',
      expiryInfo: 'This link expires in 24 hours.',
      notYou: 'If you didn\'t request this change, please ignore this email.',
      footer: 'Best regards,<br>Czakó Orsolya',
      footerNote: 'This is an automated email, please do not reply.'
    }
  }

  const content = templates[locale] || templates.hu

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.subject}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: #ec4899 !important;
            padding: 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header .icon {
            font-size: 48px;
            margin-bottom: 15px;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .description {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            background: #ec4899 !important;
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            border: none;
        }
        
        .expiry-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 30px 0;
            color: #92400e;
            font-size: 14px;
            text-align: center;
        }
        
        .security-note {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 30px 0;
            color: #0c4a6e;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-message {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 15px;
        }
        
        .footer-note {
            color: #9ca3af;
            font-size: 12px;
            font-style: italic;
        }
        
        .link-fallback {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            color: #374151;
            word-break: break-all;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .header .icon {
                font-size: 36px;
            }
            
            .reset-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${content.title}</h1>
        </div>
        
        <div class="content">
            <div class="greeting">${content.greeting}</div>
            
            <div class="description">
                ${content.description}
            </div>
            
            <div class="button-container">
                <a href="${recoveryLink}" class="reset-button">${content.buttonText}</a>
            </div>
            
            <div class="expiry-info">
                ${content.expiryInfo}
            </div>
            
            <div class="security-note">
                ${content.notYou}
            </div>
            
            <div class="link-fallback">
                ${locale === 'hu' ? 'Ha a gomb nem működik, másold be ezt a linket:' : 'If the button doesn\'t work, copy this link:'}<br>
                ${recoveryLink}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-message">
                ${content.footer}
            </div>
            <div class="footer-note">
                ${content.footerNote}
            </div>
        </div>
    </div>
</body>
</html>`

  const text = `
${content.greeting}

${content.title}

${content.description}

${content.buttonText}: ${recoveryLink}

${content.expiryInfo}

${content.notYou}

${content.footer.replace('<br>', '\n')}

${content.footerNote}
`

  return {
    subject: content.subject,
    html: html.trim(),
    text: text.trim()
  }
}

export default {
  generatePasswordRecoveryTemplate
}

