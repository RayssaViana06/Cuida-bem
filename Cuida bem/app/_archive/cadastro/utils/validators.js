/**
 * Validadores para formulários de autenticação
 */

export const validateEmail = (email) => {
  if (!email) return 'Email é obrigatório';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Email inválido';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Senha é obrigatória';
  if (password.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
  return '';
};

export const validatePasswordMatch = (password, passwordConfirm) => {
  if (password !== passwordConfirm) return 'Senhas não correspondem';
  return '';
};

export const validateName = (name) => {
  if (!name) return 'Nome é obrigatório';
  if (name.length < 3) return 'Nome deve ter no mínimo 3 caracteres';
  return '';
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  if (!age) return 'Idade é obrigatória';
  if (isNaN(numAge)) return 'Idade deve ser um número';
  if (numAge < 1 || numAge > 150) return 'Idade deve estar entre 1 e 150 anos';
  return '';
};

export const validateLoginForm = (email, password) => {
  const errors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateSignupForm = (name, email, age, password, passwordConfirm) => {
  const errors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const ageError = validateAge(age);
  if (ageError) errors.age = ageError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const passwordMatchError = validatePasswordMatch(password, passwordConfirm);
  if (passwordMatchError) errors.passwordConfirm = passwordMatchError;

  return errors;
};
