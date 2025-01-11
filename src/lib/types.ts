export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  audioURL?: string | "";
}

export interface SpeechResponse {
  text: string;
  audioUrl: string;
  timestamp: number;
}
