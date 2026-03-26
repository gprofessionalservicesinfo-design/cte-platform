import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const PACKAGES: Record<string, { name: string; amount: number }> = {
  starter:      { name: 'Plan Starter — LLC Formation',      amount: 25900 },
  professional: { name: 'Plan Professional — LLC Formation', amount: 49900 },
  premium:      { name: 'Plan Premium — LLC Formation',      amount: 73700 },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { package_id, customer_email, customer_name, state, country } = body

    const pkg = PACKAGES[package_id]
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      customer_email: customer_email || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: pkg.name },
          unit_amount: pkg.amount,
        },
        quantity: 1,
      }],
      metadata: {
        package_id,
        customer_email: customer_email || '',
        customer_name:  customer_name  || '',
        state:          state          || '',
        country:        country        || '',
      },
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:  process.env.NEXT_PUBLIC_APP_URL + '/index_final.html?checkout=cancelled',
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[create-checkout-public]', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
