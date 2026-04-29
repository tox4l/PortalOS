"use client";

import { useEffect, useRef } from "react";
import * as Ably from "ably";

type AblyMessageHandler = (message: Ably.Message) => void;

export function useAblyChannel(
  channelName: string | null,
  eventName: string,
  handler: AblyMessageHandler
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!channelName) return;

    const apiKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (!apiKey) return;

    let ably: Ably.Realtime | null = null;
    let channel: Ably.RealtimeChannel | null = null;

    const connect = async () => {
      ably = new Ably.Realtime({
        key: apiKey,
        clientId: `portalos-${Math.random().toString(36).slice(2, 9)}`
      });

      await new Promise<void>((resolve, reject) => {
        ably!.connection.once("connected", () => resolve());
        ably!.connection.once("failed", () => reject(new Error("Ably connection failed")));
      });

      channel = ably.channels.get(channelName);
      channel.subscribe(eventName, (message) => {
        handlerRef.current(message);
      });
    };

    connect();

    return () => {
      channel?.unsubscribe();
      ably?.close();
    };
  }, [channelName, eventName]);
}
