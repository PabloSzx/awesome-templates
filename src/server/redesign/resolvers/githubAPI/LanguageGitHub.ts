import gql from "graphql-tag";
import _ from "lodash";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../../utils";
import { APILevel } from "../../../consts";
import { IContext } from "../../../interfaces";
import { GitHubLanguage, Language, LanguageGitHub } from "../../entities";

@Resolver(() => LanguageGitHub)
export class LanguageGitHubResolver {
  constructor(
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(() => [LanguageGitHub])
  async languages(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("input") input: string
  ) {
    const {
      data: {
        search: { nodes },
      },
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
    >({
      query: gql`
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
      variables: {
        input,
      },
      context,
    });
    const languages = _.uniqWith(
      _.flatMap(nodes, ({ languages: { nodes } }) => nodes),
      _.isEqual
    );

    this.LanguageRepository.save(languages);

    return languages;
  }
}
