import fetch from "node-fetch";

type SearchResult = {
  messages: {
    matches: {
      channel: { id: string };
      ts: string;
    }[];
  };
};
type GetReactionsResult = {
  message: {
    text: string;
    user: string;
    reactions: {
      name: string;
      users: string[];
    }[];
  };
};

const SLACK_TOKEN = process.env.SLACK_TOKEN!;
const MY_MEMBER_ID = process.env.MY_MEMBER_ID!;

const CHANNEL_NAME = "misc-aws-exam";
const REACTION_NAME = "emo_cracker";

export const handler = async () => {
  const searchResult = await searchMessage();
  const mapPromise = searchResult.messages.matches.map(async (res) => {
    const channelId = res.channel.id;
    const timestamp = res.ts;

    const getReactionsResult = await getReactions(channelId, timestamp);

    if (isAlreadyReacted(getReactionsResult)) {
      return;
    }

    console.info("Target:", {
      timestamp,
      text: getReactionsResult.message.text,
    });

    const json = await addReaction(channelId, timestamp);

    console.log("Result:", {
      result: JSON.stringify(json),
      timestamp,
      text: getReactionsResult.message.text,
    });
  });

  await Promise.all(mapPromise);
};

// ////////////////////////
// LIB

const isAlreadyReacted = (getReactionsResult: GetReactionsResult) =>
  getReactionsResult.message.reactions
    .find((r) => r.name === REACTION_NAME)
    ?.users.includes(MY_MEMBER_ID) ?? true;

// ////////////////////////
// FETCH

/**
 * @see https://api.slack.com/methods/search.messages
 */
async function searchMessage() {
  const json = await fetchSlackApi("search.messages", {
    query: `in:#${CHANNEL_NAME} has::${REACTION_NAME}:`,
    sort: "timestamp",
    count: "10",
    sort_dir: "desc",
  });
  return json as SearchResult;
}

/**
 * @see https://api.slack.com/methods/reactions.get
 */
async function getReactions(channel: string, timestamp: string) {
  const json = await fetchSlackApi("reactions.get", { channel, timestamp });
  return json as GetReactionsResult;
}

/**
 * @see https://api.slack.com/methods/reactions.add
 */
async function addReaction(channel: string, timestamp: string) {
  const json = await fetchSlackApi("reactions.add", {
    channel,
    timestamp,
    name: REACTION_NAME,
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
// handler();
