import fetch from "node-fetch";
import { filter, from, map, mergeMap, of, tap } from "rxjs";

type ResultOfSearching = {
  messages: {
    matches: {
      channel: { id: string };
      ts: string;
    }[];
  };
};
type ResultOfGettingReactions = {
  message: {
    text: string;
    reactions: {
      name: string;
      users: string[];
    }[];
  };
};

const SLACK_TOKEN = process.env.SLACK_TOKEN!;
const MY_MEMBER_ID = process.env.MY_MEMBER_ID!;
const CHANNEL_NAME = process.env.CHANNEL_NAME!;
const REACTION_NAMES = process.env.REACTION_NAMES?.split(",") ?? [];
const REACTION_THRESHOLD = parseInt(process.env.REACTION_THRESHOLD!);

export const handler = () =>
  from(REACTION_NAMES)
    .pipe(
      mergeMap((reactionName) =>
        of(reactionName).pipe(
          mergeMap(searchMessage),
          mergeMap((result) => result.messages.matches),
          map((match) => ({
            channel: match.channel.id,
            timestamp: match.ts,
          })),
          mergeMap(({ channel, timestamp }) =>
            of({ channel, timestamp }).pipe(
              mergeMap(getReactions),
              map((result) => result.message),
              mergeMap(({ text, reactions }) =>
                of(0).pipe(
                  map(
                    () =>
                      reactions.find((r) => r.name === reactionName)?.users ??
                      []
                  ),
                  filter(
                    (reactingUsers) => !reactingUsers.includes(MY_MEMBER_ID)
                  ),
                  filter(
                    (reactingUsers) =>
                      reactingUsers.length >= REACTION_THRESHOLD
                  ),
                  tap(() => {
                    console.info("Target:", { timestamp, text });
                  }),
                  mergeMap(() => addReaction(channel, timestamp, reactionName)),
                  tap((json) => {
                    console.info("Result:", {
                      result: JSON.stringify(json),
                      timestamp,
                      text,
                    });
                  })
                )
              )
            )
          )
        )
      )
    )
    .toPromise();

// ////////////////////////
// FETCH

/**
 * @see https://api.slack.com/methods/search.messages
 */
async function searchMessage(reactionName: string): Promise<ResultOfSearching> {
  const json = await fetchSlackApi("search.messages", {
    query: `in:#${CHANNEL_NAME} has::${reactionName}:`,
    sort: "timestamp",
    count: "5",
    sort_dir: "desc",
  });
  return json as ResultOfSearching;
}

/**
 * @see https://api.slack.com/methods/reactions.get
 */
async function getReactions(params: { channel: string; timestamp: string }) {
  const json = await fetchSlackApi("reactions.get", params);
  return json as ResultOfGettingReactions;
}

/**
 * @see https://api.slack.com/methods/reactions.add
 */
async function addReaction(
  channel: string,
  timestamp: string,
  reactionName: string
) {
  const json = await fetchSlackApi("reactions.add", {
    channel,
    timestamp,
    name: reactionName,
  });
  return json;
}

const URL_BASE = "https://slack.com/api/";
const methodMap = {
  "search.messages": "GET",
  "reactions.get": "GET",
  "reactions.add": "POST",
};
async function fetchSlackApi(
  method: "reactions.get" | "reactions.add" | "search.messages",
  params: Record<string, string>
) {
  const url = `${URL_BASE}/${method}?${new URLSearchParams(params).toString()}`;
  const result = await fetch(url, {
    method: methodMap[method],
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = await result.json();
  return json;
}

// for debug
// handler().then(
//   () => console.info("Success."),
//   (err) => console.error(err)
// );
