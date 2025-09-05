import Link from 'next/link'
import { Check, Crown, Zap, Users, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small teams and contractors',
      features: [
        'Up to 5 active projects',
        'Basic quality management',
        'Document management',
        'HSE incident tracking',
        'Email support',
        'Mobile app access'
      ],
      limitations: [
        'Limited to 10 users',
        'Basic reporting only',
        'No API access'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For growing construction companies',
      features: [
        'Unlimited projects',
        'Advanced quality management',
        'Full HSE compliance suite',
        'ITP & inspection management',
        'Advanced reporting & analytics',
        'API access',
        'Priority support',
        'Custom integrations'
      ],
      limitations: [
        'Up to 50 users',
        'Standard SLA'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations and enterprises',
      features: [
        'Everything in Professional',
        'Unlimited users',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment option',
        '24/7 phone support',
        'Advanced security features'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const addons = [
    {
      name: 'Advanced Analytics',
      price: '$25/month',
      description: 'Detailed project insights and predictive analytics'
    },
    {
      name: 'GIS Integration',
      price: '$15/month',
      description: 'Interactive maps and location-based tracking'
    },
    {
      name: 'Email Integration',
      price: '$10/month',
      description: 'Automated email processing and threading'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include a 14-day free trial.
          </p>

          {/* Free Trial Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              <span className="font-semibold">14-Day Free Trial</span>
            </div>
            <p className="text-sm text-primary/80 mt-1">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={plan.popular ? 'ring-2 ring-primary transform scale-105' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">{plan.price}</div>
                  <div className="text-muted-foreground">{plan.period}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mb-6 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/auth/login'}>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Optional Add-ons</h2>
            <p className="text-muted-foreground">Extend your ProjectPro experience with additional features</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {addons.map((addon, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">{addon.name}</h3>
                    <div className="text-2xl font-bold text-primary mb-1">{addon.price}</div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
                <p className="text-muted-foreground">No setup fees for any plan. Enterprise plans may have custom implementation fees.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. No cancellation fees.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of construction professionals who trust ProjectPro to deliver quality projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </Link>
          </div>

          <p className="text-sm opacity-75 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
