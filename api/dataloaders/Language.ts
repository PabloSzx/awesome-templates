import DataLoader from "dataloader";
import { keyBy, map } from "lodash";

import { DocumentType } from "@typegoose/typegoose";

import { Language, LanguageModel } from "../entities";

export const LanguageUpsertDataLoader = new DataLoader(
  async (languages: readonly { name: string; color?: string }[]) => {
    const languagesHash = keyBy(languages, ({ name }) => name);

    const data = await Promise.all(
      map(languagesHash, ({ name, color }) => {
        return LanguageModel.findOneAndUpdate(
          {
            name,
          },
          {
            color,
          },
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    const languagesHashData = data.reduce<
      Record<string, DocumentType<Language>>
    >((acum, doc) => {
      acum[doc.name] = doc;
      return acum;
    }, {});

    return languages.map(({ name }) => languagesHashData[name]);
  },
  {
    cacheKeyFn: ({ name }) => name,
  }
);
