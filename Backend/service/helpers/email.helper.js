const nodemailer = require('nodemailer')

let transport = null

/**
 * Initialize email transport
 */
const initMail = function () {
    // Ellenőrizzük hogy vannak-e az SMTP beállítások
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('[EMAIL] SMTP konfiguráció hiányzik - emailek konzolra kerülnek')
        return
    }

    transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
    
    console.log('[EMAIL] SMTP transport inicializálva:', process.env.SMTP_HOST)
}

/**
 * Send an email
 */
const sendMail = async function (to, subject, text = null, html = null) {
    // Ha nincs transport, inicializáljuk
    if (!transport) {
        initMail()
    }
    
    // Ha még mindig nincs transport (hiányzó konfiguráció), csak logoljuk
    if (!transport) {
        console.log('=== EMAIL WOULD BE SENT ===')
        console.log(`To: ${to}`)
        console.log(`Subject: ${subject}`)
        if (text) console.log(`Text: ${text}`)
        if (html) console.log(`HTML: ${html}`)
        console.log('==========================')
        
        return { success: true, development: true }
    }

    const message = {
        from: process.env.SMTP_USER, // A feladó ugyanaz mint a bejelentkezett user
        to,
        subject,
        text,
        html
    }

    try {
        console.log(`[EMAIL] Küldés: ${to} - ${subject}`)
        const info = await transport.sendMail(message)
        console.log(`[EMAIL] Sikeres küldés! Message ID: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('[EMAIL] Küldési hiba:', error.message)
        return { success: false, error: error.message }
    }
}

module.exports = {
    initMail,
    sendMail
};
