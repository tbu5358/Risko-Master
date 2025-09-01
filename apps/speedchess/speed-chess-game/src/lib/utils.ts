import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique username for users who don't have one
export function generateUniqueUsername(): string {
  // Check if user already has a username
  try {
    const stored = sessionStorage.getItem("username");
    if (stored && stored !== "Guest") {
      return stored;
    }
  } catch {}

  // Generate a unique username
  const adjectives = ["Swift", "Mighty", "Brave", "Wise", "Noble", "Fierce", "Calm", "Bold", "Quick", "Sharp"];
  const nouns = ["Knight", "Rook", "Bishop", "Queen", "King", "Pawn", "Warrior", "Champion", "Master", "Player"];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  const username = `${adjective}${noun}${number}`;
  
  // Store the generated username
  sessionStorage.setItem("username", username);
  
  return username;
}
