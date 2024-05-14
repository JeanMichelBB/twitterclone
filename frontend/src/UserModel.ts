// src/UserModel.ts
interface User {
    id: string;
    username: string;
    email: string;
    full_name: string;
    profile_picture: string;
    bio: string;
    location: string;
    website: string;
    date_joined: string; // Assuming it's a string representing a date
  }
  
  export default User;
  