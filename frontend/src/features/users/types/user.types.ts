export type UserDto = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
};

export type CurrentUserDto = {
  email: string;
  name?: string | null;
  fullName?: string | null;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  password: string;
};
