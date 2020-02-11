import gql from "graphql-tag";
import levenshtein from "js-levenshtein";
import _ from "lodash";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { APILevel } from "../../consts";
import { LanguageUpsertDataLoader } from "../../dataloaders/Language";
import { GitHubLanguage, LanguageGitHub, LanguageModel } from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

@Resolver(() => LanguageGitHub)
export class LanguageGitHubResolver {
  @Authorized(APILevel.ADVANCED)
  @Query(() => [LanguageGitHub])
  async searchLanguages(
    @Ctx() { authGitHub }: IContext,
    @Arg("input") input: string
  ) {
    const {
      search: { nodes },
    } = await GitHubAPI.query<
      {
        search: {
          nodes: Array<{
            languages: {
              nodes: Array<GitHubLanguage>;
            };
          }>;
        };
      },
      {
        input: string;
      }
    >(
      gql`
        query search($input: String!) {
          search(type: REPOSITORY, query: $input, first: 20) {
            nodes {
              ... on Repository {
                id
                languages(first: 15) {
                  nodes {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      `,
      authGitHub,
      {
        input,
      }
    );
    const languages = _.orderBy(
      _.uniqWith(
        _.flatMap(nodes, ({ languages: { nodes } }) => nodes),
        _.isEqual
      ),
      [
        ({ name }) =>
          _.includes(name.toLowerCase(), input.toLowerCase()) ||
          _.includes(input.toLowerCase(), name.toLowerCase()),
        ({ name }) => levenshtein(name.toLowerCase(), input.toLowerCase()),
      ],
      ["desc", "asc"]
    );
    if (!_.isEmpty(languages)) {
      await Promise.all(
        languages
          .filter(lang => {
            return !!(lang.color && lang.name);
          })
          .map(({ name, color }) => {
            return LanguageUpsertDataLoader.load({ name, color });
          })
      );
    }

    return languages;
  }
}
