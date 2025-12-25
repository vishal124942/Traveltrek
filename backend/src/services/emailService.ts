import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMembershipIdEmail = async (
  email: string,
  name: string,
  membershipId: string,
  planType: string
): Promise<any> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TravelTrek <onboarding@resend.dev>', // Replace with your verified domain in production
      to: [email],
      subject: 'Welcome to TravelTrek - Your Membership ID',
      html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                    <h1 style="color: #667EEA; text-align: center;">Welcome to TravelTrek!</h1>
                    <p>Hi ${name},</p>
                    <p>Your membership request has been approved! We are excited to have you as a member of TravelTrek.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #718096; font-size: 14px;">Your Membership ID</p>
                        <p style="margin: 10px 0 0 0; color: #1a202c; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${membershipId}</p>
                    </div>

                    <p><strong>Plan Details:</strong> ${planType === '1Y' ? '1-Year' : planType === '3Y' ? '3-Year' : '5-Year'} Membership</p>
                    
                    <p>You can now log in to your account using your Membership ID and the password you set during enrollment.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3001/member-login" style="background-color: #667EEA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
                    </div>
                    
                    <p style="margin-top: 40px; font-size: 12px; color: #a0aec0; text-align: center;">
                        If you have any questions, please contact our support team at support@traveltrek.com
                    </p>
                </div>
            `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TravelTrek <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to TravelTrek!',
      html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Welcome to TravelTrek, ${name}!</h1>
                    <p>We are thrilled to have you join our community of travelers.</p>
                    <p>Our team is currently reviewing your membership request. You will receive another email with your Membership ID once approved.</p>
                    <p>In the meantime, feel free to explore our destinations on the website.</p>
                    <p>Best regards,<br>The TravelTrek Team</p>
                </div>
            `,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};
