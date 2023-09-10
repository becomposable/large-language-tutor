
export interface VerifyContentResult {
    is_correct: boolean,
    importance: "low" | "medium" | "high",
    correction?: string,
    explanation?: string
}