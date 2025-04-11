import { IMessage } from "@/types/chat";

export default function MessageGroup({
  messages,
  userId,
}: {
  messages: IMessage[];
  userId: string;
}) {
  return (
    <>
      {messages.map((msg, index) => {
        const firstInGroup =
          index === 0 || messages[index - 1].userId !== msg.userId;
        const isCurrentUser = msg.userId === userId;

        return (
          <div
            key={index}
            className={`flex flex-col ${
              isCurrentUser ? "items-start" : "items-end"
            }`}
          >
            {firstInGroup && (
              <div
                className={`text-xs ${index > 0 && "mt-3"} ${
                  isCurrentUser ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {msg.sender}
              </div>
            )}
            <div
              className={`${
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              } px-3 py-1 rounded-md`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </>
  );
}
