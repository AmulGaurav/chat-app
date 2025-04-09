export interface IMessage {
  isCurrentUser: boolean;
  content: string;
  sender: string;
  timestamp: Date;
}
