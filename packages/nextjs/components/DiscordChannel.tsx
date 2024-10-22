import React, { useEffect, useState } from "react";
import DiscordMessages from "./DiscordMessages";

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

interface Message {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  reactions: Reaction[];
  mentions: Mention[];
  channels: Channel[];
}

interface Reaction {
  emoji: {
    id: string | null;
    name: string;
  };
  count: number;
}

const DiscordChannel = ({ channelId }: { channelId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = () => {
      fetch(process.env.NEXT_PUBLIC_WEBAPP_URL + `/api/discord?channelId=${channelId}&limit=10`)
        .then(response => response.json())
        .then(data => setMessages(data.messages))
        .catch(error => console.error("Error fetching messages:", error));
    };

    // Fetch messages immediately
    fetchMessages();

    // Set up an interval to fetch messages every minute
    const intervalId = setInterval(fetchMessages, 60000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [channelId]);

  console.log("messages", messages);

  const leaderboardMap = new Map<string, { username: string; name: string; avatar: string; count: number }>();

  messages.forEach(message => {
    // Count message authors
    const author = message.author;
    if (!leaderboardMap.has(author.username)) {
      leaderboardMap.set(author.username, {
        username: author.username,
        name: author.name,
        avatar: author.avatar,
        count: 0,
      });
    }
    leaderboardMap.get(author.username)!.count++;

    // Count mentioned users
    message.mentions.forEach(mention => {
      if (!leaderboardMap.has(mention.username)) {
        leaderboardMap.set(mention.username, {
          username: mention.username,
          name: mention.name,
          avatar: mention.avatar,
          count: 0,
        });
      }
      leaderboardMap.get(mention.username)!.count++;
    });
  });

  const leaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Get top 10 users

  console.log("Leaderboard:", leaderboard);

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8 justify-center">
          {leaderboard.map(user => (
            <div key={user.username} className="flex items-center space-x-2 my-4">
              <img src={user.avatar} alt={user.name || user.username} className="w-16 h-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="h-[670px] overflow-y-scroll">
          <DiscordMessages messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default DiscordChannel;
