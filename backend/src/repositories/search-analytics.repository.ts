import { prisma } from "../config/prisma";
import { BaseRepository } from "./base.repository";

export class SearchAnalyticsRepository extends BaseRepository {

    async increment(query: string) {
        return this.prisma.searchAnalytics.upsert({
            where: {
                query
            },
            create: {
                query
            },
            update: {
                searchCount: {
                    increment: 1
                },
                lastSearchedAt: new Date()
            }
        });

    }

    async getTrending() {
        return this.prisma.searchAnalytics.findMany({
            take: 10,
        });
    }

    async incrementClick(query: string) {
        return this.prisma.searchAnalytics.upsert({
            where: {
                query,
            },

            create: {
                query,
                searchCount: 0,
                clickCount: 1,
                lastClickedAt: new Date(),
            },

            update: {
                clickCount: {
                    increment: 1,
                },

                lastClickedAt: new Date(),
            },
        });
    }

    async findByQueries(queries: string[]) {
        return this.prisma.searchAnalytics.findMany({
            where: {
                query: {
                    in: queries,
                },
            },
        });
    }
}