export function validateMatchInput(body: any) {
    const errors: string[] = [];
  
    if (!body.wager || typeof body.wager !== "number" || body.wager < 0) {
      errors.push("Invalid wager");
    }
  
    if (!body.time_control || ![3, 5].includes(body.time_control)) {
      errors.push("Invalid time control");
    }
  
    return {
      valid: errors.length === 0,
      errors,
    };
  }