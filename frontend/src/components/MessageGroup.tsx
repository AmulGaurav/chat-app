import { IMessage } from "@/types/chat";

export default function MessageGroup({ messages }: { messages: IMessage[] }) {
  //   console.log(messages);

  return (
    <>
      {messages.map((msg, index) => {
        const firstInGroup =
          index === 0 || messages[index - 1].sender !== msg.sender;

        return (
          <div key={index}>
            {firstInGroup && <div>{msg.sender}</div>}
            <div>{msg.content}</div>
          </div>
        );
      })}
    </>
  );
}
