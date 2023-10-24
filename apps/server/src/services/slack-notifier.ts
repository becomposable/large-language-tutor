/** Slack Notifier Service 
 * Enable sending slack messages to a channel to inform about activities in the app
 * This is the admin service not the service that is used by users to get notifications about their account
 **/

import { LogLevel, WebClient } from "@slack/web-api";
import Env from "../env.js";
import logger from "../logger.js";

let slackClient: WebClient | undefined = undefined;

function getSlackClient(): WebClient | undefined {

    if (!Env.slack.token) {
        logger.error("[slack] No token provided - cannot initialize client");
        return;
    }

    if (!slackClient) {
        slackClient = new WebClient(Env.slack.token, {
            logLevel: LogLevel.INFO
        });
        logger.info("[slack] Slack client initialized");
    }
    return slackClient;
}


export async function sendSlackMessage(message: string, targetChannel?: string) {

    const client = getSlackClient();
    if (!client) return;

    const channel = targetChannel ?? Env.slack.defaultChannel;

    if (!channel) {
        logger.error("[slack] No channel provided");
        return;
    }

    await client.chat.postMessage({
        channel,
        text: message
    }).catch((e) => {
        logger.error("[slack] Error while sending message", e);
    }
    );

}