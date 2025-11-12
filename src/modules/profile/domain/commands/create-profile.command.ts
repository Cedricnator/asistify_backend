export interface CreateProfileCommand {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleId: string;
  avatar?: string;
}
