import mongoose from 'mongoose';
import type { ObjectId as ObjectIdType } from 'mongoose';


interface IVocabularydEvent {
    _id: ObjectIdType;
    score: string;  //-1
    seen_at: Date;
    metadata: {
        user_id: string;
        word: string;
        event_type: string; //lookup, view
    }
}

export type VocabularyEventDocument = mongoose.Document<ObjectIdType, any, IVocabularydEvent> & IVocabularydEvent;

const VocabularyEventSchema = new mongoose.Schema({
    score: String,  //-1
    seen_at: Date,
    metadata: {
        user_id: String,
        word: String,
        event_type: String, //lookup, view
    }
},
    {
        timeseries: {
            timeField: 'seen_at',
            metaField: 'metadata',
            granularity: 'hours'
        },
        autoCreate: false,
        expireAfterSeconds: 60*60*24*30*36, // 36 months
    }
);

export const VocabularyEvent = mongoose.model<VocabularyEventDocument>('VocabularyEvent', VocabularyEventSchema);

