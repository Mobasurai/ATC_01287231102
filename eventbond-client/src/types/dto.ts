export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
}