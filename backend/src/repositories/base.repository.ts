import { prisma } from "../config/prisma";

export abstract class BaseRepository {
  protected prisma = prisma;
}