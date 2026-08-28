import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing in Vercel settings');
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name)')
      .eq('id', order_id)
      .single();

    if (error) throw error;

    if (order.profiles?.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1A2744;">Order Confirmed!</h1>
          <p>Hi ${order.profiles.full_name || 'Customer'},</p>
          <p>Thank you for placing your order with us. Your order #${order_id.slice(-8)} totaling Rs. ${order.total_price.toLocaleString()} has been confirmed.</p>
          <p>Since you chose Cash on Delivery, please have the cash ready when the order arrives.</p>
          <br/>
          <p>Best regards,<br/><strong>Khurshid Books</strong></p>
        </div>
      `;

      await resend.emails.send({
        from: 'Khurshid Books <onboarding@resend.dev>', // Update this with your verified domain email later
        to: order.profiles.email,
        subject: `Order Confirmation #${order_id.slice(-8)}`,
        html: emailHtml,
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending order email:', err);
    res.status(500).json({ error: err.message });
  }
}
