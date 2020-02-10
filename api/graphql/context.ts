import Fastify from "fastify";
import { IncomingMessage, ServerResponse } from "http";
import { PromiseType } from "utility-types";

}
export async function context(
  request: Fastify.FastifyRequest<
    IncomingMessage,
    Fastify.DefaultQuery,
    Fastify.DefaultParams,
    Fastify.DefaultHeaders,
    never
  >,
  reply: Fastify.FastifyReply<ServerResponse>
) {
  try {
    await request.jwtVerify();
  } catch (err) {

  }
  return {
    request,
    reply,
    user: request.user
  }
}

export type IContext = PromiseType<ReturnType<typeof context>>;
