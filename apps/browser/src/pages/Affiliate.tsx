import { useState } from "react";
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Share2, DollarSign, TrendingUp, Users, Clock, CreditCard, Star } from 'lucide-react';

const Affiliate = () => {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");

  const commissionTiers = [
    { tier: "Tier 1", referrals: "0-100", commission: "10%", color: "bg-secondary" },
    { tier: "Tier 2", referrals: "101-500", commission: "20%", color: "bg-accent" },
    { tier: "Tier 3", referrals: "501+", commission: "30%", color: "bg-primary" },
  ];

  const testimonials = [
    { name: "Alex Chen", quote: "I made $5,000 last month just sharing my link!", avatar: "AC" },
    { name: "Sarah Kim", quote: "The 30% commission tier is incredible. Best affiliate program!", avatar: "SK" },
    { name: "Mike Ross", quote: "Easy to use dashboard and payments are always on time.", avatar: "MR" },
  ];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle affiliate signup
    console.log("Affiliate signup:", { email, wallet });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Earn More by Spreading the Word
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our affiliate program and start earning up to 30% commission on every referred spin.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground px-8 py-4 text-lg">
              Sign Up Now
            </Button>
          </section>

          {/* How It Works */}
          <section className="container mx-auto px-4 py-20 bg-muted/30">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Sign Up</h3>
                <p className="text-muted-foreground">Quick form with name, email, and wallet address to get started.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Share Your Link</h3>
                <p className="text-muted-foreground">Get your unique referral code and URL to share with friends.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Earn Rewards</h3>
                <p className="text-muted-foreground">Up to 30% commission paid automatically on all referrals.</p>
              </div>
            </div>
          </section>

          {/* Commission Tiers */}
          <section className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Commission Tiers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {commissionTiers.map((tier, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <Badge className={`${tier.color} text-white w-fit mx-auto mb-2`}>
                      {tier.tier}
                    </Badge>
                    <CardTitle className="text-2xl">{tier.commission}</CardTitle>
                    <CardDescription>Commission Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tier.referrals} referrals</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Affiliate Dashboard Preview */}
          <section className="container mx-auto px-4 py-20 bg-muted/30">
            <h2 className="text-3xl font-bold text-center mb-12">Affiliate Dashboard Preview</h2>
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12,543</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">247</div>
                    <div className="text-sm text-muted-foreground">Active Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$8,420</div>
                    <div className="text-sm text-muted-foreground">Commissions Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$7,200</div>
                    <div className="text-sm text-muted-foreground">Total Payouts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                View Your Dashboard
              </Button>
            </div>
          </section>

          {/* Payout & Terms */}
          <section className="container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Payout & Terms</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payout Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Weekly payouts via USDC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Minimum payout: $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>No fees on withdrawals</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Program Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">• No self-referral allowed</p>
                  <p className="text-sm text-muted-foreground">• GDPR compliant data handling</p>
                  <p className="text-sm text-muted-foreground">• 24/7 customer support</p>
                  <p className="text-sm text-muted-foreground">• Real-time commission tracking</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Testimonials */}
          <section className="container mx-auto px-4 py-20 bg-muted/30">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Affiliates Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Join Now Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-muted-foreground">No fees. 24/7 support. Start earning today.</p>
            </div>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Join the Affiliate Program</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="wallet">Wallet Address (USDC)</Label>
                    <Input
                      id="wallet"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground">
                    Sign Up Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Affiliate;