import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import prisma from "../app/api/_db/db";
import { generateReferalCode } from "../app/api/_utils/referralCode";
import loggerServer from "../loggerServer";
import { hash } from "bcrypt";
import { ObjectId } from "mongodb";
import { InvalidCredentialsError } from "../models/errors/InvalidCredentialsError";
import { UnknownUserError } from "../models/errors/UnknownUserError";
import UserAlreadyExistsError from "../models/errors/UserAlreadyExistsError";
import { cookies } from "next/headers";

export const authorize = async (
  credentials: any & {
    email: string;
    password: string;
    displayName: string;
    isSignIn: string;
    referralCode: string;
  },
  req: any,
) => {
  if (!credentials) {
    throw new Error("Unknown errror");
  }

  const hashedPassword = await hash(credentials.password, 10);

  const user = await prisma.appUser.findFirst({
    where: {
      email: credentials.email,
    },
  });
  if (credentials.isSignIn === "true") {
    if (user) {
      const isValid = hashedPassword === user.password;
      if (!isValid) {
        throw new InvalidCredentialsError();
      }
      return user;
    } else {
      throw new UnknownUserError();
    }
  } else {
    if (user) {
      throw new UserAlreadyExistsError();
    }
    try {
      const id = new ObjectId().toHexString();
      const newUser = await prisma.appUser.create({
        data: {
          userId: id,
          displayName: credentials.displayName,
          email: credentials.email,
          password: hashedPassword,
          webUserId: id,
        },
      });
      // set userId to be newUser.userId
      await prisma.appUser.update({
        where: {
          email: credentials.email,
        },
        data: {
          webUserId: newUser.id,
        },
      });

      return { ...newUser };
    } catch (e: any) {
      loggerServer.error("Error creating user", "new_user", { error: e });
      throw e;
    }
  }
};

export const getSession = async ({
  session,
  token,
  user,
}: {
  session: Session;
  token: JWT;
  user: AdapterUser;
}) => {
  if (session?.user) {
    session.user.webUserId = token.sub!;
  }

  return session;
};

export const signIn = async (session: any) => {
  try {
    let additionalUserData = {};
    let userInDB = await prisma.appUser.findFirst({
      where: {
        webUserId: session.user.id,
      },
    });

    if (!userInDB) {
      const newUser = await prisma.appUser.create({
        data: {
          userId: session.user.id,
          email: session.user.email || "",
          displayName: session.user.name || "",
          webUserId: session.user.id,
        },
      });
      additionalUserData = { ...newUser };
    }

    return {
      ...session,
      ...additionalUserData,
    };
  } catch (e: any) {
    loggerServer.error("Error signing in", session.user.id, { error: e });
  }
};
