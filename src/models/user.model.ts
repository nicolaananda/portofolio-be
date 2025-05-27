import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  isLocked: boolean;
  lockUntil?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): { accessToken: string; refreshToken: string };
  generatePasswordResetToken(): string;
  isPasswordChangedAfter(tokenTimestamp: number): boolean;
  incrementFailedLoginAttempts(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lastFailedLogin: Date,
    isLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: Date,
    twoFactorSecret: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // Hash password with cost factor 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Update passwordChangedAt if password is modified
  if (this.isModified('password')) {
    this.passwordChangedAt = new Date();
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT tokens
userSchema.methods.generateAuthToken = function(): { accessToken: string; refreshToken: string } {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!secret || !refreshSecret) {
    throw new Error('JWT secrets are not defined');
  }

  const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  const accessTokenOptions: SignOptions = {
    expiresIn: accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(
    { id: this._id },
    secret,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { id: this._id },
    refreshSecret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

// Check if password was changed after token was issued
userSchema.methods.isPasswordChangedAfter = function(tokenTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );
    return tokenTimestamp < changedTimestamp;
  }
  return false;
};

// Increment failed login attempts
userSchema.methods.incrementFailedLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts += 1;
  this.lastFailedLogin = new Date();
  
  if (this.failedLoginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = undefined;
  await this.save();
};

export const User = mongoose.model<IUser>('User', userSchema); 