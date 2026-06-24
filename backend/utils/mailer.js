const nodemailer = require('nodemailer');

/**
 * Sends an email notification to info@sreepayanamtours.com containing
 * all details of the newly submitted inquiry.
 * Falls back to console logging if SMTP settings are not provided in environment.
 * 
 * @param {Object} enquiryData Plain JS object containing enquiry fields
 */
const sendEnquiryEmail = async (enquiryData) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || 'info@sreepayanamtours.com';
  const to = 'info@sreepayanamtours.com';

  console.log(`[Mailer] Preparing to send enquiry email for: ${enquiryData.customerName || 'Unknown Customer'}`);

  let transporter;
  let isEthereal = false;

  if (!host || !user || !pass) {
    console.warn('⚠️ [Mailer] SMTP settings are not configured in .env. Creating Ethereal Test Account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('✅ [Mailer] Created Ethereal Test Account:', testAccount.user);
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
    } catch (err) {
      console.error('❌ [Mailer] Failed to create Ethereal account, falling back to console logging.', err);
      console.log(JSON.stringify(enquiryData, null, 2));
      return;
    }
  } else {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // Dynamically build HTML rows for all standard properties
  let detailsHtml = '';
  
  const addRow = (label, value) => {
    if (value !== undefined && value !== null && value !== '') {
      let displayValue = value;
      if (value instanceof Date) {
        displayValue = value.toLocaleDateString('en-IN');
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      }
      detailsHtml += `
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%; background-color: #f8fafc; color: #475569;">${label}</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; color: #1e293b;">${displayValue}</td>
        </tr>`;
    }
  };

  // Populate core details
  addRow('Enquiry Type', enquiryData.enquiryType);
  addRow('Customer Name', enquiryData.customerName);
  addRow('Mobile Number', enquiryData.mobileNumber);
  addRow('Email Address', enquiryData.emailId);
  addRow('Travel Date', enquiryData.travelDate);
  addRow('Return Date', enquiryData.returnDate);
  addRow('From Location', enquiryData.fromLocation);
  addRow('To Location', enquiryData.toLocation);
  addRow('Number of Passengers', enquiryData.numberOfPassengers);
  addRow('Adult Count', enquiryData.adultCount);
  addRow('Child Count', enquiryData.childCount);
  addRow('Budget (INR)', enquiryData.budget ? `₹${enquiryData.budget.toLocaleString('en-IN')}` : '');
  addRow('Preferred Category', enquiryData.preferredCategory);
  addRow('Status', enquiryData.status);

  // Parse specialized fields if present
  addRow('Hotel Check-in', enquiryData.hotelCheckIn);
  addRow('Hotel Check-out', enquiryData.hotelCheckOut);
  addRow('Rooms Required', enquiryData.hotelRooms);
  addRow('Hotel Category', enquiryData.hotelCategory);
  addRow('Flight Class', enquiryData.flightClass);
  addRow('Flight Type', enquiryData.flightType);
  addRow('Train Class', enquiryData.trainClass);
  addRow('Car Type', enquiryData.carType);
  addRow('Car Driver Option', enquiryData.carDriverOption);
  addRow('Remarks / Remarks Description', enquiryData.remarks);

  // If detailedPreferences exists, render it
  if (enquiryData.detailedPreferences && typeof enquiryData.detailedPreferences === 'object') {
    detailsHtml += `
      <tr>
        <td colspan="2" style="padding: 12px; border: 1px solid #cbd5e1; background-color: #f1f5f9; font-weight: 800; text-align: center; text-transform: uppercase; color: #1e3a8a; font-size: 0.9rem;">
          Detailed Preferences (10-Section Travel Itinerary Form)
        </td>
      </tr>`;
    
    const prefs = enquiryData.detailedPreferences;
    for (const [key, value] of Object.entries(prefs)) {
      if (value !== undefined && value !== null && value !== '') {
        const formattedKey = key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        addRow(formattedKey, value);
      }
    }
  }

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.5px;">SreePayanam Tours & Travels</h2>
        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">New Client Travel Enquiry Alert</p>
      </div>
      <div style="padding: 24px; background-color: white;">
        <p style="font-size: 1rem; color: #334155; margin-top: 0;">Hello SreePayanam Travel Team,</p>
        <p style="font-size: 0.95rem; color: #475569; line-height: 1.5;">A new inquiry has been received through the SreePayanam platform. The client details and preferences are structured below:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; border: 1px solid #cbd5e1;">
          <tbody>
            ${detailsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center;">
          <a href="http://localhost:5173/admin" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 0.88rem; box-shadow: 0 2px 4px rgba(30,58,138,0.2);">
            Open Admin CRM Dashboard
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
        This email was automatically generated by the SreePayanam Lead Management System.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"SreePayanam Alerts" <${from}>`,
    to,
    subject: `📢 New Inquiry: ${enquiryData.customerName || 'Guest'} - ${enquiryData.enquiryType || 'General'}`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    if (isEthereal) {
      console.log(`🔗 [Mailer] Ethereal Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error('❌ [Mailer] SMTP Send Error:', error);
  }
};

module.exports = { sendEnquiryEmail };
