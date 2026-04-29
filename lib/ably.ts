import * as Ably from "ably";
import { requireEnv } from "@/lib/env";

let restClient: Ably.Rest | null = null;

export function getAblyRest(): Ably.Rest {
  if (!restClient) {
    restClient = new Ably.Rest({
      key: requireEnv("ABLY_API_KEY"),
      clientId: "portalos-server"
    });
  }

  return restClient;
}

export function getProjectChannelName(projectId: string): string {
  return `project:${projectId}`;
}

export function getAgencyActivityChannelName(agencyId: string): string {
  return `agency:${agencyId}:activity`;
}

export function getAgencyNotificationsChannelName(agencyId: string): string {
  return `agency:${agencyId}:notifications`;
}

export function getClientNotificationsChannelName(clientIdOrSlug: string): string {
  return `client:${clientIdOrSlug}:notifications`;
}
