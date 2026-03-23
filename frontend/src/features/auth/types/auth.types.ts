export type AuthUser = {
  email: string;
  fullName: string;
};

export type AuthResponse = {
  token: string;
  fullName: string;
  email: string;
};

export type AuthRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};
