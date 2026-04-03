import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const PACKAGES: Record<string, { name: string; amount: number }> = {
  basic:   { name: 'Plan Basic — LLC Formation',        amount: 49900  },
  growth:  { name: 'Plan Growth — LLC Formation',       amount: 79900  },
  premium: { name: 'Plan Premium — LLC Formation',      amount: 120000 },
}

const STATE_FEES: Record<string, number> = {
  AL:150,AK:250,AZ:50, AR:45, CA:70, CO:50, CT:120,DE:140,FL:125,GA:100,
  HI:50, ID:100,IL:150,IN:95, IA:50, KS:165,KY:40, LA:100,ME:175,MD:100,
  MA:500,MI:50, MN:135,MS:53, MO:50, MT:35, NE:105,NV:425,NH:100,NJ:125,
  NM:50, NY:200,NC:125,ND:135,OH:99, OK:100,OR:100,PA:125,RI:150,SC:110,
  SD:150,TN:300,TX:300,UT:54, VT:125,VA:100,WA:200,WV:100,WI:130,WY:62,
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      plan,
      state_code,
      customer_email,
      phone,
      company_name,
      terms_accepted_at,
      addons_total,
    } = body

    const pkg = PACKAGES[plan]
    if (!pkg) {
      return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 })
    }

    const stateCode  = (state_code || 'WY').toUpperCase()
    const stateFeeUsd = STATE_FEES[stateCode] ?? 62
    const addonsCents = Math.round((addons_total || 0) * 100)

    // Build client_reference_id — same format the webhook parser expects
    const refParts: string[] = []
    if (terms_accepted_at) refParts.push(`ta_${terms_accepted_at}`)
    if (phone)             refParts.push(`ph_${phone}`)
    const clientReferenceId = refParts.join('||') || undefined

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: pkg.name },
          unit_amount: pkg.amount,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `State Filing Fee — ${stateCode}` },
          unit_amount: stateFeeUsd * 100,
        },
        quantity: 1,
      },
    ]

    if (addonsCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Add-ons' },
          unit_amount: addonsCents,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      customer_email: customer_email || undefined,
      client_reference_id: clientReferenceId,
      line_items: lineItems,
      metadata: {
        plan,
        company_name:  company_name  || '',
        state_code:    stateCode,
        phone:         phone         || '',
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/checkout.html`,
    })

    console.log('[create-checkout-public] session created:', session.id, '| client_reference_id:', clientReferenceId ?? '(none)')
    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('[create-checkout-public]', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
