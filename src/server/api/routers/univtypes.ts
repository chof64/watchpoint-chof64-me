import neatCsv from "neat-csv";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type UniverseTypes = {
  typeID: string;
  groupID: string;

  typeName: string;
  description: string;

  mass: string;
  volume: string;

  capacity: string;
  portionSize: string;

  raceID: string;

  basePrice: string;
  published: string;
  marketGroupID: string;

  iconID: string;
  soundID: string;
  graphicID: string;
};

export const univTypesRouter = createTRPCRouter({
  seed: publicProcedure.query(async ({ ctx }) => {
    const getLatest = async () => {
      const res = await fetch(
        "https://www.fuzzwork.co.uk/dump/latest/invTypes.csv",
      );
      if (!res.ok) throw new Error("Failed to fetch invTypes.csv");
      const resData = await res.text();

      return await neatCsv(resData);
    };

    const updateMetadata = async () => {
      return await ctx.db.metadata.upsert({
        where: {
          name: "universeTypes",
        },
        create: {
          name: "universeTypes",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endpoint: "https://www.fuzzwork.co.uk/dump/latest/invTypes.csv",
        },
        update: {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    };

    const updateCache = async () => {
      const data = (await getLatest()) as UniverseTypes[];

      if (!data) throw new Error("Failed to fetch invTypes.csv");

      await ctx.db.universeTypes.deleteMany({});

      return {
        db: await ctx.db.universeTypes.createMany({
          data,
        }),
        data: data,
      };
    };

    const timestamp: Date = new Date();

    const metadata = await ctx.db.metadata.findUnique({
      where: {
        name: "universeTypes",
      },
    });

    if (!metadata || metadata.expires < timestamp) {
      const { data } = await updateCache();
      const metaDb = await updateMetadata();

      return {
        cache: metaDb,
        data: data,
      };
    }

    const data = await ctx.db.universeTypes.findMany();

    if (!data) {
      const { data } = await updateCache();
      const metaDb = await updateMetadata();

      return {
        cache: metaDb,
        data: data,
      };
    }

    return {
      cache: metadata,
      data: data,
    };
  }),
});
