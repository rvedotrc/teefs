import { SmeeClient } from "smee-client";
import { protoSafeParse, type JSONValue } from "@blaahaj/json";

export type SmeeMessage<T> = {
  timestamp: number;
  query: Record<string, string | string[]>; // in the case of "?foo", value is ""
  body: T;
  // plus HTTP headers
};

export const jsonParsingClient = async <T extends JSONValue>(opts: {
  channel: string;
  onMessage?: (message: SmeeMessage<T>) => void;
  onError?: (error: {
    code: number | undefined;
    message: string | undefined;
  }) => void;
}) => {
  const client = new SmeeClient({
    source: opts.channel,
    target: "https://bogus.example.com/",
    forward: false,
  });

  client.onmessage = (messageEvent: { data: string }) => {
    const eventData = protoSafeParse(messageEvent.data) as SmeeMessage<T>;
    opts.onMessage?.(eventData);
  };

  client.onerror = (ev) =>
    opts.onError?.({ code: ev.code, message: ev.message });

  await client.start();

  return {
    close: () => client.stop(),
  };
};

export const singleShotJson = <T extends JSONValue>(
  onUrl: (url: string) => void
) =>
  SmeeClient.createChannel().then(async (channel) => {
    const { promise, resolve, reject } = Promise.withResolvers<T>();

    const client = await jsonParsingClient({
      channel,
      onError: (error) => reject(error),
      onMessage: (message) => resolve(message.body as T),
    });

    onUrl(channel);
    return promise.finally(() => client.close());
  });
