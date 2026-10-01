import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:                 { type: String, required: true },
  email:                { type: String, required: true, unique: true },
  password:             { type: String },
  role:                 { type: String, enum: ['User', 'Creator', 'Admin'], required: true },
  phone:                { type: String },
  // Google OAuth
  googleId:             { type: String },
  authProvider:         { type: String, enum: ['local', 'google'], default: 'local' },
  // Creator-specific
  expertise:            { type: String },
  portfolio:            { type: String },
  bio:                  { type: String },
  profilePhoto:         { type: String },
  profilePhotoPublicId: { type: String },
  categories:           [{ type: String, trim: true }],
  // Social links
  website:              { type: String },
  twitter:              { type: String },
  instagram:            { type: String },
  youtube:              { type: String },
  // User-specific
  interests:            { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
