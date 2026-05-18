import { Error, Schema, model } from 'mongoose';
import config from '../../config';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface';
import { Login_With, Role, USER_ROLE } from './user.constants';

const userSchema: Schema<IUser> = new Schema(
  {
    //basic info
    name: {
      type: String,
      required: true,
      default: null,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Role,
      default: USER_ROLE.user,
    },

    //profile info
    profile: {
      type: String,
      default: null,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Others'],
      default: null,
    },
    dateOfBirth: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^(\+?\d{8,15})$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      default: null,
    },
    location: {
      type: String,
      default: null,
    },

    //extra info
    // customerId: {
    //   type: String,
    //   default: null,
    // },
    // privacySettings: {
    //   type: Boolean,
    //   default: true,
    // },
    // bio: {
    //   type: String,
    //   default: null,
    // },
    // rank: {
    //   type: String,
    // },
    // fleet: {
    //   type: Number,
    //   enum: [797, 777, 787, 350, 380],
    // },
    // agreements: {
    //   type: String,
    //   default: null,
    // },
    // referralCode: {
    //   type: String,
    //   default: null,
    // },

    //auth info
    loginWth: {
      type: String,
      enum: Login_With,
      default: Login_With.credentials,
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    expireAt: {
      type: Date,
      default: () => {
        const expireAt = new Date();
        return expireAt.setMinutes(expireAt.getMinutes() + 20);
      },
    },
    needsPasswordChange: {
      type: Boolean,
    },
    passwordChangedAt: {
      type: Date,
    },

    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
    device: {
      ip: {
        type: String,
      },
      browser: {
        type: String,
      },
      os: {
        type: String,
      },
      device: {
        type: String,
      },
      lastLogin: {
        type: String,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

userSchema.pre('save', async function (next) {
  const user = this;
  if (this.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  next();
});

// set '' after saving password
// userSchema.post(
//   'save',
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   function (error: Error, doc: any, next: (error?: Error) => void): void {
//     doc.verification.otp = 0;
//     doc.password = '';
//     next();
//   },
// );

// userSchema.post(
//   'findOneAndUpdate',
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   function (error: Error, doc: any, next: (error?: Error) => void): void {
//     doc.verification.otp = 0;
//     doc.password = '';
//     next();
//   },
// );

userSchema.statics.isUserExist = async function (phoneNumber: string) {
  return await User.findOne({ phoneNumber: phoneNumber }).select('+password');
};
userSchema.statics.isUserExistEmail = async function (email: string) {
  return await User.findOne({ email: email }).select('+password');
};

userSchema.statics.isUserExist = async function (
  phoneNumber?: string,
  email?: string,
) {
  const query: any[] = [];

  if (phoneNumber) {
    query.push({ phoneNumber });
  }

  if (email) {
    query.push({ email });
  }

  if (query.length === 0) {
    return null; // nothing provided
  }

  const existingUser = await User.findOne({
    $or: query,
  }).select('+password');

  if (!existingUser) {
    return null;
  }

  return {
    user: existingUser,
    phoneExists: phoneNumber ? existingUser.phoneNumber === phoneNumber : false,
    emailExists: email ? existingUser.email === email : false,
  };
};

userSchema.statics.IsUserExistId = async function (id: string) {
  return await User.findById(id).select('+password');
};
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.post('save', function (doc, next) {
  doc.password = '';
  doc.verification.otp = 0;
  next();
});

userSchema.post('findOneAndUpdate', function (doc, next) {
  doc.password = '';
  doc.verification.otp = 0;
  next();
});

export const User = model<IUser, UserModel>('User', userSchema);
