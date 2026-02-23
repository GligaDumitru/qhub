import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { IAccountDoc } from "./database/account.model";
import { IUserDoc } from "./database/user.model";
import { api } from "./lib/api";
import { SignInSchema } from "./lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
      }
      return session;
    },
  },
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

        const { data: existingAccount } = (await api.accounts.getByProvider(email)) as ActionResponse<IAccountDoc>;
        if (!existingAccount) {
          return null;
        }

        const { data: existingUser } = (await api.users.getById(
          existingAccount.userId.toString()
        )) as ActionResponse<IUserDoc>;
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
});
