export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required.";
  if (!emailRegex.test(email)) return "Please enter a valid email address.";
  return null;
};

export const validateUsername = (username: string) => {
  if (!username) return "Username is required.";
  if (username.trim().length < 3) return "Username must be at least 3 characters.";
  return null;
};

export const validatePassword = (password: string) => {
  if (!password) return "Password is required.";
  
  // 1. Check Length first
  if (password.length < 6) return "Password must be at least 6 characters.";

  // 2. Initialize a list of missing requirements
  const missing: string[] = [];

  // Check for Capital Letter
  if (!/[A-Z]/.test(password)) {
    missing.push("an uppercase letter");
  }

  // Check for Number
  if (!/\d/.test(password)) {
    missing.push("a number");
  }

  // Check for Special Character
  // I included common ones: @ $ ! % * ? &
  if (!/[@$!%*?&]/.test(password)) {
    missing.push("a special character (@$!%*?&)");
  }

  // 3. Construct the error message
  if (missing.length > 0) {
    // If they are missing all 3, this returns: 
    // "Password needs: an uppercase letter, a number, a special character."
    return `Password needs: ${missing.join(", ")}.`; 
  }

  return null; // No errors
};