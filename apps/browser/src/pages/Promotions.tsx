import { useState, useEffect } from "react";
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, Share2, Copy, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Promotions = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  // Hero carousel data
  const heroPromos = [
    {
      id: 1,
      title: "Welcome Bonus",
      tagline: "Get 100% match on your first deposit up to $500",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop",
      ctaText: "Claim Now"
    },
    {
      id: 2,
      title: "Weekend Reload",
      tagline: "50% bonus every Saturday & Sunday",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop",
      ctaText: "Claim Now"
    },
    {
      id: 3,
      title: "VIP Cashback",
      tagline: "Up to 20% cashback for premium members",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop",
      ctaText: "Claim Now"
    }
  ];

  // Active promotions data
  const activePromos = [
    {
      id: 1,
      title: "Daily Spin Bonus",
      description: "Get free spins every day when you log in",
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      category: "Daily"
    },
    {
      id: 2,
      title: "High Roller Special",
      description: "Exclusive bonuses for deposits over $1000",
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      category: "VIP"
    },
    {
      id: 3,
      title: "Lucky Friday",
      description: "Triple rewards every Friday 6PM-12AM",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      category: "Weekly"
    },
    {
      id: 4,
      title: "Streak Multiplier",
      description: "Play 5 days in a row for increasing multipliers",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      category: "Challenge"
    }
  ];

  // Upcoming promotions
  const upcomingPromos = [
    {
      id: 1,
      title: "Summer Festival",
      date: "July 25, 2025",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=200&fit=crop",
      description: "Mega tournament with $50,000 prize pool"
    },
    {
      id: 2,
      title: "Crypto Rewards",
      date: "July 30, 2025",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=200&fit=crop",
      description: "Earn cryptocurrency bonuses"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPromos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroPromos.length]);

  // Countdown timer hook
  const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("FRIEND123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CountdownTimer = ({ expiresAt }: { expiresAt: Date }) => {
    const timeLeft = useCountdown(expiresAt);
    
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span className="text-cyan-400 font-mono">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
        <span>left</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto">
          {/* Hero Carousel */}
          <div className="relative w-full h-80 overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" 
                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {heroPromos.map((promo, index) => (
                <div key={promo.id} className="w-full flex-shrink-0 relative">
                  <div 
                    className="w-full h-80 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${promo.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white max-w-2xl px-4">
                        <h2 className="text-4xl md:text-6xl font-bold mb-4">{promo.title}</h2>
                        <p className="text-xl md:text-2xl mb-8 text-slate-200">{promo.tagline}</p>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                          {promo.ctaText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Controls */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + heroPromos.length) % heroPromos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroPromos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroPromos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-16 py-8">
            {/* Active Promotions Grid */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-slate-100">Active Promotions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePromos.map((promo) => (
                  <Card key={promo.id} className="bg-slate-800 border-slate-700 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-purple-300">{promo.title}</CardTitle>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                          {promo.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-300">
                        {promo.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                          Join
                        </Button>
                        <CountdownTimer expiresAt={promo.expiresAt} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Upcoming Teasers */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-100">Coming Soon</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {upcomingPromos.map((promo) => (
                  <Card key={promo.id} className="flex-shrink-0 w-80 bg-slate-800 border-slate-700">
                    <div className="relative">
                      <img 
                        src={promo.image} 
                        alt={promo.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {promo.date}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-purple-300">{promo.title}</h3>
                      <p className="text-slate-300 text-sm mb-4">{promo.description}</p>
                      <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Bell className="w-4 h-4 mr-2" />
                        Set Reminder
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Share & Referral Callout */}
            <section className="bg-primary rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Invite Friends, Earn Rewards</h2>
              <p className="mb-6 text-slate-100">Share your referral code and get bonuses for every friend who joins</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Input 
                    value="FRIEND123" 
                    readOnly 
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-300"
                  />
                </div>
                <Button 
                  onClick={handleCopyReferral}
                  variant="secondary"
                  className="bg-white text-primary hover:bg-slate-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Promotions;