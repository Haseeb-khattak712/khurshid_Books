import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.RESEND_API_KEY) {
      throw new Error('API keys are missing in Vercel settings');
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { session_id, order_id } = req.body;

    if (!session_id || !order_id) {
      return res.status(400).json({ error: 'Missing session_id or order_id' });
    }

    // 1. Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // 2. Update order in Supabase
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ is_paid: true })
      .eq('id', order_id)
      .select('*, profiles(email, full_name)')
      .single();

    if (updateError) {
      throw updateError;
    }

    // 3. Send Confirmation Email via Resend
    if (order.profiles?.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1A2744;">Payment Successful!</h1>
          <p>Hi ${order.profiles.full_name || 'Customer'},</p>
          <p>Thank you for your purchase. We have received your payment of Rs. ${order.total_price.toLocaleString()} for order #${order_id.slice(-8)}.</p>
          <p>We are now processing your order and will notify you once it ships.</p>
          <br/>
          <p>Best regards,<br/><strong>Khurshid Books</strong></p>
        </div>
      `;

      await resend.emails.send({
        from: 'Khurshid Books <onboarding@resend.dev>', // Use onboarding@resend.dev for testing, or verified domain email
        to: order.profiles.email,
        subject: `Payment Receipt for Order #${order_id.slice(-8)}`,
        html: emailHtml,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: err.message });
  }
}
