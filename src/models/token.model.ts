import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
  };
  isValid: boolean;
  expiresAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        required: true,
      },
      ipAddress: {
        type: String,
        required: true,
      },
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
tokenSchema.index({ userId: 1, refreshToken: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const Token = mongoose.model<IToken>('Token', tokenSchema);
