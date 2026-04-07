import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatarGender: 'male' | 'female' | 'neutral';
  subjects: string[];
  presenceIntervalMinutes: number;
  sensitivityLevel: 'low' | 'medium' | 'high';
  totalSessions: number;
  totalFocusMinutes: number;
  streak: number;
  lastActiveDate: Date | null;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatarGender: { type: String, enum: ['male', 'female', 'neutral'], default: 'neutral' },
  subjects: { type: [String], default: [] },
  presenceIntervalMinutes: { type: Number, default: 10 },
  sensitivityLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  totalSessions: { type: Number, default: 0 },
  totalFocusMinutes: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  onboardingComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
