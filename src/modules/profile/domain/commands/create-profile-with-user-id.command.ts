import { CreateProfileCommand } from './create-profile.command';

export interface CreateProfileWithUserIdCommand extends CreateProfileCommand {
  userId: string;
}
