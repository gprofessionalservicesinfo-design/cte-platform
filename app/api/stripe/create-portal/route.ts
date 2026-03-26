import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RLS ensures this returns only the current client's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, stripe_customer_id, company_name')
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    let customerId = company.stripe_customer_id

    // Auto-create Stripe customer if not yet linked
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
          company_name:     company.company_name,
        },
      })

      customerId = customer.id

      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', company.id)
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
