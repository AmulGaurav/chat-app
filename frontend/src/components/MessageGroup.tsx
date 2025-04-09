import { IMessage } from "@/types/chat";

export default function MessageGroup({ messages }: { messages: IMessage[] }) {
  return (
    <>
      {messages.map((msg, index) => {
        const firstInGroup =
          index === 0 || messages[index - 1].sender !== msg.sender;
        console.log(msg);
        console.log(index);
        console.log("\n");

        return (
          <div
            key={index}
            className={`flex flex-col ${
              msg.isCurrentUser ? "items-start" : "items-end"
            }`}
          >
            {firstInGroup && (
              <div
                className={`text-xs ${index > 0 && "mt-3"} ${
                  msg.isCurrentUser ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {msg.sender}
              </div>
            )}
            <div
              className={`${
                msg.isCurrentUser === true
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
