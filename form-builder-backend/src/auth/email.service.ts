import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'vjsathish4444@gmail.com', 
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'vjsathish4444@gmail.com',
      to: email,
      subject: 'Password Reset OTP - Form Builder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your Form Builder account.</p>
          <p>Your OTP (One-Time Password) is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #10b981; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Form Builder Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendFormSubmissionNotification(email: string, formTitle: string, formId: string, submissionDate: Date): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'vjsathish4444@gmail.com',
      to: email,
      subject: '🎉 New Form Submission Received!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 New Form Submission</h1>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Great news! Someone submitted your form.</h2>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Form Name:</strong> ${formTitle}</p>
              <p style="margin: 5px 0;"><strong>Submitted Date:</strong> ${submissionDate.toLocaleDateString()} at ${submissionDate.toLocaleTimeString()}</p>
              <p style="margin: 5px 0;"><strong>Form ID:</strong> ${formId}</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/forms/${formId}/responses" 
                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📊 View Responses
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This is an automated notification from Form Builder. You're receiving this because you own this form.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Form submission notification sent to ${email} for form: ${formTitle}`);
    } catch (error) {
      console.error('Error sending form submission notification:', error);
      throw new Error('Failed to send form submission notification');
    }
  }
}
