import { IConversation } from "../../types";
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export function getConversationTitle(conversation: IConversation | undefined) {
    if (!conversation) return '';
    if (conversation.title) return conversation.title;
    return dayjs(conversation.created).format('LL');
}
