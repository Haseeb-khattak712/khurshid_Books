import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, items, userEmail } = req.body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amount in lowest denomination (e.g. cents/paisa)
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: userEmail,
      client_reference_id: orderId,
      success_url: `${process.env.VITE_PUBLIC_URL || 'http://localhost:5173'}/order/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_PUBLIC_URL || 'http://localhost:5173'}/checkout?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ error: err.message });
  }
}
