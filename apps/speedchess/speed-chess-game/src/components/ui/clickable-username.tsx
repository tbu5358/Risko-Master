import { useNavigate } from "react-router-dom";

interface ClickableUsernameProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
}

export function ClickableUsername({ username, className = "", children }: ClickableUsernameProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Convert username to URL-friendly format (lowercase, no spaces)
    const userId = username.toLowerCase().replace(/\s+/g, "");
    navigate(`/profile/${userId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`hover:text-electric-blue transition-colors duration-200 cursor-pointer ${className}`}
    >
      {children || username}
    </button>
  );
} 