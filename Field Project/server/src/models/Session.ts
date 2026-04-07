import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  isTutorial: boolean;
  tutorialUrl?: string;
  tutorialPlatform?: string;
  startTime: Date;
  endTime?: Date;
  wallClockSeconds: number;
  verifiedFocusSeconds: number;
  distractionSeconds: number;
  presenceFailSeconds: number;
  tabSwitchCount: number;
  presenceCheckCount: number;
  presenceFailCount: number;
  efficiencyScore: number;
  verdict: 'champion' | 'good' | 'okay' | 'distracted' | 'not-focused';
  treeStage: 0 | 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'completed' | 'abandoned';
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  isTutorial: { type: Boolean, default: false },
  tutorialUrl: { type: String },
  tutorialPlatform: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  wallClockSeconds: { type: Number, default: 0 },
  verifiedFocusSeconds: { type: Number, default: 0 },
  distractionSeconds: { type: Number, default: 0 },
  presenceFailSeconds: { type: Number, default: 0 },
  tabSwitchCount: { type: Number, default: 0 },
  presenceCheckCount: { type: Number, default: 0 },
  presenceFailCount: { type: Number, default: 0 },
  efficiencyScore: { type: Number, default: 0 },
  verdict: { type: String, enum: ['champion', 'good', 'okay', 'distracted', 'not-focused'] },
  treeStage: { type: Number, enum: [0, 1, 2, 3, 4, 5], default: 0 },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
});

export default mongoose.model<ISession>('Session', SessionSchema);
