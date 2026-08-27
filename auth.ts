import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import slugify from "slugify";
import Account, { IAccountDoc } from "./database/account.model";
import User from "./database/user.model";
import dbConnect from "./lib/mongoose";
import { SignInSchema } from "./lib/validations";

async function upsertOAuthAccount({
  provider,
  providerAccountId,
  user,
}: SignInWithOAuthProps): Promise<IAccountDoc | null> {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const slugifiedUsername = slugify(user.username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email: user.email }).session(session);
    if (!existingUser) {
      [existingUser] = await User.create([{ ...user, username: slugifiedUsername }], { session });
    } else {
      const updatedData: { name?: string; image?: string } = {};
      if (user.name !== existingUser.name) updatedData.name = user.name;
      if (user.image !== existingUser.image) updatedData.image = user.image;
      if (Object.keys(updatedData).length > 0) {
        existingUser = await User.findByIdAndUpdate(existingUser._id, updatedData, { new: true }).session(session);
      }
    }

    if (!existingUser) {
      await session.abortTransaction();
      return null;
    }

    let existingAccount = await Account.findOne({ userId: existingUser._id, provider, providerAccountId }).session(
      session
    );
    if (!existingAccount) {
      [existingAccount] = await Account.create(
        [{ userId: existingUser._id, name: user.name, image: user.image, provider, providerAccountId }],
        { session }
      );
    }

    await session.commitTransaction();
    return existingAccount;
  } catch {
    await session.abortTransaction();
    return null;
  } finally {
    await session.endSession();
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
        userId: {},
        username: {},
        name: {},
        image: {},
      },
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        await dbConnect();
        const existingAccount = await Account.findOne({ provider: "credentials", providerAccountId: email });
        if (!existingAccount) {
          return null;
        }

        const existingUser = await User.findById(existingAccount.userId);
        if (!existingUser) {
          return null;
        }

        if (!existingAccount.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, existingAccount.password);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        const isCredentials = account.type === "credentials";
        if (isCredentials) {
          return token;
        }

        await dbConnect();
        const existingAccount = await Account.findOne({
          provider: account.provider,
          providerAccountId: account.providerAccountId as string,
        });

        if (!existingAccount) {
          return token;
        }

        const userId = existingAccount.userId.toString();
        if (userId) {
          token.sub = userId;
        }
      }

      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.type === "credentials") return true;

      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username:
          account.provider === "github" ? (profile?.login as string) : (user.name?.toLocaleLowerCase() as string),
      };

      const existingAccount = await upsertOAuthAccount({
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId as string,
        user: userInfo,
      });

      return existingAccount !== null;
    },
  },
});
