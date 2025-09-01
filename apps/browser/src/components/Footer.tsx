import { Link } from "react-router-dom";
import { Clock, Zap, Star, Send, Twitter, Github } from "lucide-react";

type ChipProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
};
const Chip = ({ icon: Icon, children }: ChipProps) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/15 px-3 py-0.5 text-xs text-purple-300">
    <Icon className="w-3.5 h-3.5" />
    {children}
  </span>
);

type FooterLinkProps = {
  to?: string;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};
const FooterLink = ({ to, href, external, children, className, ...rest }: FooterLinkProps) => {
  const base = "text-zinc-200 hover:text-white transition";
  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`${base} ${className || ""}`} {...rest}>
        {children}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={`${base} ${className || ""}`} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href || "#"} className={`${base} ${className || ""}`} {...rest}>
      {children}
    </a>
  );
};

type SocialLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};
const SocialLink = ({ href, label, icon: Icon }: SocialLinkProps) => (
  <FooterLink href={href} external aria-label={label} className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-purple-300" />
    <span>{label}</span>
  </FooterLink>
);

export const Footer = () => {
  return (
    <footer className="w-full bg-card/30 border-t border-zinc-800/60">
      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-14">
          {/* Brand block */}
          <div>
            <Link to="/" aria-label="Risko Home" className="inline-flex items-center mb-4">
              <img
                src="/lovable-uploads/9F784482-4A00-4F24-88AF-0D271AAFB7E2.png"
                alt="Risko"
                className="h-10 w-auto rounded-md"
              />
            </Link>

            <p className="text-zinc-400 max-w-xs leading-relaxed mb-4">
              The ultimate PvP gambling platform. Risk it. Win it. Competitive gaming meets strategic betting.
            </p>

            <div className="flex flex-wrap gap-2">
              <Chip icon={Clock}>Provably Fair</Chip>
              <Chip icon={Zap}>Instant Payouts</Chip>
              <Chip icon={Star}>Web3 Powered</Chip>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-400 mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><FooterLink to="/how-to-play">How to Play</FooterLink></li>
              <li><FooterLink to="/rules">Game Rules</FooterLink></li>
              <li><FooterLink to="/live-support">Support</FooterLink></li>
              <li><FooterLink to="/terms">Terms & Privacy</FooterLink></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-400 mb-4">Community</h4>
            <ul className="space-y-3">
              <li><SocialLink href="https://discord.com" label="Discord" icon={Send} /></li>
              <li><SocialLink href="https://t.me" label="Telegram" icon={Send} /></li>
              <li><SocialLink href="https://twitter.com" label="Twitter" icon={Twitter} /></li>
              <li><SocialLink href="https://github.com" label="Github" icon={Github} /></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-zinc-800/60" />
      </div>

      {/* Legal bar */}
      <div className="w-full border-t border-zinc-800/60">
        <div className="w-full max-w-7xl mx-auto">
          <p className="text-center text-xs text-zinc-500 py-6">
            © 2024 Risko · Built for competitive gamers · Powered by Risko.io
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
