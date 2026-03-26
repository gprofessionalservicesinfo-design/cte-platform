import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { ADDONS } from '@/lib/billing'

// POST /api/stripe/create-checkout
// Body: { addon_id: string }
// Creates a one-time Stripe Checkout Session for an add-on purchase.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { addon_id } = body as { addon_id: string }

    const addon = ADDONS.find((a) => a.id === addon_id)
    if (!addon) {
      return NextResponse.json({ error: 'Unknown add-on' }, { status: 400 })
    }

    // Get company (RLS filters automatically)
    const { data: company } = await supabase
      .from('companies')
      .select('id, stripe_customer_id, company_name, order_reference')
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = company.stripe_customer_id
    if (!customerId) {
      const { data: profile } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        name:  profile?.full_name ?? undefined,
        metadata: {
          supabase_user_id: user.id,
          company_id:       company.id,
        },
      })
      customerId = customer.id

      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', company.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        'payment',
      line_items: [
        {
          price_data: {
            currency:     'usd',
            unit_amount:  addon.price * 100, // cents
            product_data: {
              name:        addon.label,
              description: addon.description,
              metadata:    { addon_id: addon.id },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        company_id:      company.id,
        addon_id:        addon.id,
        order_reference: company.order_reference ?? '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?addon_success=${addon.id}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      invoice_creation: { enabled: true },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
