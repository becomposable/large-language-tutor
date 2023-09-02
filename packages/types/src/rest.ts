//interface for REST reponses, using a data property with the content, a 
//type to specify the type, the interface should have a base interface and 
//be extended with specific interface to type the response
export interface ResponsePayload<T> {
    data: T;
    type: string;
    generated_at: Date;
}