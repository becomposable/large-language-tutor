/** Slack Notifier Service 
 * Enable sending slack messages to a channel to inform about activities in the app
 * This is the admin service not the service that is used by users to get notifications about their account
 **/

import Env from "../env.js";
import { WebClient } from "@l"


const client = new WebClient("xoxb-your-token", {
  logLevel: LogLevel.DEBUG
});




export async function sendSlackMessage (message: string, targetChannel?: string) {

    const channel = targetChannel ?? Env.slack.defaultChannel;

    const res = await client.chat.postMessage({
        channel,
        text: message,
    });

}