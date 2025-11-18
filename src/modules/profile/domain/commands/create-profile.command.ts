export interface CreateProfileCommand {
  name: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  userId: string;
  avatar?: string;
}
