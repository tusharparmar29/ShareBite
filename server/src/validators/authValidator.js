const validateRegister = (data) => {
  const errors = [];
  const { name, email, password, role } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long.');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address.');
    }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long.');
  }

  // Disallow registering as admin publicly
  if (role) {
    const allowedPublicRoles = ['donor', 'ngo'];
    if (!allowedPublicRoles.includes(role)) {
      if (role === 'admin') {
        errors.push('Admin accounts cannot be registered publicly.');
      } else {
        errors.push(`Invalid role '${role}'. Public accounts may only be 'donor' or 'ngo'.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRegister,
  validateLogin
};
