import { Smile } from "lucide-react";

interface Author {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface Mention {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface Channel {
  id: string;
  name: string;
  url: string;
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  url: string;
  proxy_url: string;
  content_type?: string;
  width?: number;
  height?: number;
}

interface Message {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  reactions: Reaction[];
  mentions: Mention[];
  channels: Channel[];
  attachments: Attachment[];
}

interface Reaction {
  emoji: {
    id: string | null;
    name: string;
  };
  count: number;
}

const ReactionButton: React.FC<{ reaction: Reaction }> = ({ reaction }) => (
  <button className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-sm text-gray-300">
    <span>{reaction.emoji}</span>
    <span>{reaction.count}</span>
  </button>
);

const MessageContent: React.FC<{ content: string; mentions: Mention[]; channels: Channel[] }> = ({
  content,
  mentions,
}) => {
  const parts = content.split(/(<@[^>]+>)/);
  return (
    <p className="mt-1 text-left">
      {parts.map((part, index) => {
        const mention = part.match(/<@([^>]+)>/);
        if (mention) {
          const username = mention[1];
          const user = mentions.find(m => m.username === username);
          return (
            <span key={index} className="bg-blue-500 text-white rounded px-1">
              @{user ? user.name || user.username : "Unknown User"}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
};

const AttachmentPreview: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const isImage = attachment.content_type?.startsWith("image/");

  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img src={attachment.proxy_url} alt={attachment.filename} className="max-w-full max-h-96 rounded" />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 text-blue-500 hover:underline"
    >
      📎 {attachment.filename} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
    </a>
  );
};

export default function DiscordMessages({ messages }: { messages: Message[] }) {
  if (!messages) return null;
  if (messages.length === 0) return <div>No messages</div>;
  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div key={message.id} className="flex space-x-3">
          <img
            src={message.author.avatar}
            alt={message.author.name || message.author.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="font-bold">{message.author.name || message.author.username}</span>
              <span className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleString()}</span>
            </div>
            <MessageContent content={message.content} mentions={message.mentions} channels={message.channels} />
            {message.attachments.map(attachment => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
            <div className="flex space-x-2 mt-2">
              {message.reactions?.map((reaction, index) => (
                <ReactionButton key={index} reaction={reaction} />
              ))}
              <button className="text-gray-400 hover:text-gray-300">
                <Smile size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
