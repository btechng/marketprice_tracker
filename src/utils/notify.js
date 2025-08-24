
import nodemailer from 'nodemailer';
import { config } from '../config.js';

export const maybeSendEmail = async ({ to, subject, text })=>{
  if(!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    console.log('Email skipped (no SMTP configured):', { to, subject });
    return false;
  }
  try{
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port || 587,
      secure: config.smtp.port == 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass }
    });
    await transporter.sendMail({ from: config.smtp.user, to, subject, text });
    return true;
  }catch(e){
    console.error('Failed to send email', e);
    return false;
  }
};
