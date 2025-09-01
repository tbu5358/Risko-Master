export function generateMatchId(): string {
    return crypto.randomUUID();
  }
  
  export function now(): string {
    return new Date().toISOString();
  }