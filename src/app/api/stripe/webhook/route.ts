import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const generationId = session.client_reference_id;

    if (generationId) {
      await supabase
        .from('generations')
        .update({ paid: true })
        .eq('id', generationId);
    }
  }

  return NextResponse.json({ received: true });
}
