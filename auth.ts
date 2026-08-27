import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Account, { IAccountDoc } from "./database/account.model";
import User from "./database/user.model";
import { api } from "./lib/api";
import dbConnect from "./lib/mongoose";
import { SignInSchema } from "./lib/validations";

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

        const { data: existingAccount, success } = (await api.accounts.getByProvider(
          account.providerAccountId as string
        )) as ActionResponse<IAccountDoc>;

        if (!success || !existingAccount) {
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

      const { success } = (await api.auth.oAuthSignIn({
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId as string,
        user: userInfo,
      })) as ActionResponse;

      return success;
    },
  },
});
