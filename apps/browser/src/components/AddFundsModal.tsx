
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Zap, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFundsModal = ({ isOpen, onClose }: AddFundsModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'card'>('card');
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, addFunds } = useAuthStore();

  const quickAmounts = ['10.00', '25.00', '50.00', '100.00'];

  const paymentMethods = [
    {
      id: 'card' as const,
      name: 'Credit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
      recommended: true
    },
    {
      id: 'crypto' as const,
      name: 'Cryptocurrency',
      icon: Wallet,
      description: 'ETH, BTC, USDC supported',
      recommended: false
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount greater than $0.00');
      return;
    }

    // Placeholder: Redirect to Stripe for payment processing
    // When Stripe is integrated, this will create a Checkout Session and redirect to its URL.
    const usd = parseFloat(amount).toFixed(2);
    toast.message('Redirecting to Stripe', {
      description: `Preparing payment for $${usd} USD...`
    });

    // Small delay to let the user see the toast, then redirect.
    setTimeout(() => {
      window.location.href = 'https://stripe.com';
    }, 600);
  };

  if (showSuccess) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-center flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Add Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-primary text-xl font-semibold">
              {typeof user?.balance === 'number'
                ? `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00'}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-sm">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 bg-input border-border text-lg"
              placeholder="0.00"
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount)}
                  className="border-border hover:border-primary/50"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="text-sm mb-3 block">Payment Method</Label>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/10 neon-glow'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{method.name}</p>
                            {method.recommended && (
                              <Badge className="bg-accent text-accent-foreground text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ This is a demo. You'll be redirected to Stripe.com as a placeholder.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground neon-glow"
            disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Continue to Stripe — ${amount || '0.00'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
