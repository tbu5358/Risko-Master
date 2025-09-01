import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { login, signup } = useAuthStore();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await login(formData.email, formData.password);
        
        if (error) {
          // Handle specific authentication errors
          let errorMessage = "Something went wrong. Please try again.";
          
          if (error.message?.includes('Email not confirmed')) {
            errorMessage = "Please check your email and confirm your account before logging in.";
          } else if (error.message?.includes('Invalid login credentials')) {
            errorMessage = "Invalid email or password. Please check your credentials.";
          } else if (error.message?.includes('Too many requests')) {
            errorMessage = "Too many login attempts. Please wait a moment and try again.";
          }
          
          toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
          });
          return; // Don't close modal on error
        }
        
        // Success case - only show success if no error occurred
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${formData.email.split('@')[0]}!`,
        });
        
        onClose();
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setErrors({});
      } else {
        const { error } = await signup(formData.username, formData.email, formData.password);
        
        if (error) {
          let errorMessage = "Failed to create account. Please try again.";
          
          if (error.message?.includes('User already registered')) {
            errorMessage = "An account with this email already exists. Please try logging in instead.";
          } else if (error.message?.includes('Password should be at least')) {
            errorMessage = "Password must be at least 6 characters long.";
          } else if (error.message?.includes('Invalid email')) {
            errorMessage = "Please enter a valid email address.";
          }
          
          toast({
            title: "Signup Failed",
            description: errorMessage,
            variant: "destructive",
          });
          return; // Don't close modal on error
        }
        
        setIsSuccess(true);
        return; // Don't close modal yet, show success message
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    onClose();
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleSuccessClose}>
        <DialogContent className="sm:max-w-md" aria-labelledby="success-title">
          <DialogHeader>
            <DialogTitle id="success-title">Welcome to Risko! 🎉</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-lg mb-2">Welcome, {formData.username}!</p>
            <p className="text-muted-foreground mb-4">
              Your account has been created successfully! Please check your email to confirm your account before logging in.
            </p>
            <p className="text-sm text-muted-foreground">
              After confirming your email, you can log in and start exploring all features.
            </p>
          </div>
          <Button onClick={handleSuccessClose} className="w-full">
            Continue to Platform
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-labelledby="auth-title">
        <DialogHeader>
          <DialogTitle id="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Join Risko'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={errors.username ? 'border-destructive' : ''}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};