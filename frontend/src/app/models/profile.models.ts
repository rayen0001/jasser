export interface UserProfile {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  role: string;
  createdAt: string;
}

export interface UpdateProfilePayload {
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
}