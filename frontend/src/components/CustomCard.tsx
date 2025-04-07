import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircleMore } from "lucide-react";
import { ReactNode } from "react";

export default function CustomCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center mt-16">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex gap-2 items-center">
            <MessageCircleMore className="w-6 h-6" />
            <div>Real Time Chat</div>
          </CardTitle>
          <CardDescription>
            temporary room that expires after all users exit
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
