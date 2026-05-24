const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function validateLogin(email: string, password: string): string | null {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return "Vui lòng nhập email";
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return "Email phải đúng định dạng";
  }
  if (!password) {
    return "Vui lòng nhập mật khẩu";
  }
  return null;
}

export interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export function validateSignup(values: SignupFormValues): string | null {
  const username = values.username.trim();
  if (!username) {
    return "Vui lòng nhập tên đăng nhập";
  }
  if (username.length < 3) {
    return "Tên đăng nhập phải có ít nhất 3 ký tự";
  }
  if (!USERNAME_RE.test(username)) {
    return "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
  }

  const email = values.email.trim();
  if (!email) {
    return "Vui lòng nhập email";
  }
  if (!EMAIL_RE.test(email)) {
    return "Email phải đúng định dạng";
  }

  if (values.fullName !== undefined && values.fullName.trim() === "") {
    return "Họ tên không được để trống";
  }

  if (!values.password) {
    return "Vui lòng nhập mật khẩu";
  }
  if (values.password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  if (!PASSWORD_RE.test(values.password)) {
    return "Mật khẩu phải có ít nhất một chữ cái và một chữ số";
  }

  if (!values.confirmPassword) {
    return "Vui lòng xác nhận mật khẩu";
  }
  if (values.password !== values.confirmPassword) {
    return "Mật khẩu xác nhận không khớp";
  }

  return null;
}
