import { createTRPCRouter } from "~/server/api/trpc";
import { univTypesRouter } from "./routers/univtypes";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  univtypes: univTypesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
