import { NextRequest } from "next/server";

// Bot login token from Discord Developer Portal
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Replace with your bot token

const channels = {};

async function fetchChannelName(channelId: string) {
  if (channels[channelId]) {
    return channels[channelId];
  }
  const url = `https://discord.com/api/v10/channels/${channelId}`;

  if (!channelId.match(/^\d+$/)) {
    throw new Error(`Invalid channel id: ${channelId}`);
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`, // Authorization with bot token
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching channel: ${channelId}:${response.status} ${response.statusText}`);
  }

  const channelData = await response.json();
  channels[channelId] = channelData.name;
  return channelData.name;
}

function getAvatarUrl(userId: string, avatarHash: string): string {
  if (!avatarHash) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}

async function processContent(content: string, mentions: any[]): Promise<any> {
  let output = content;

  // Handle Discord channel links
  const regex = /https:\/\/discord.com\/channels\/(\d+)\/(\d+)(\/(\d+))?/g;
  const matches = output.match(regex);

  const channels = [];
  if (matches) {
    for (const match of matches) {
      const channelId = match.split("/")[5];
      const channel = await fetchChannelName(channelId);
      output = output.replace(match, `#${channel}`);
      channels.push({ id: channelId, name: channel, url: match });
    }
  }

  // Handle user mentions
  mentions = mentions.map(mention => {
    output = output.replace(`<@${mention.id}>`, `<@${mention.username}>`);
    return {
      id: mention.id,
      username: mention.username,
      name: mention.global_name,
      avatar: getAvatarUrl(mention.id, mention.avatar),
    };
  });

  return { content: output, mentions, channels };
}

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit") || 10;
  const channelId = request.nextUrl.searchParams.get("channelId");
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`, // Authorization with bot token
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching messages: ${response.status} ${response.statusText}`);
  }

  const messages = await response.json();
  const output = await Promise.all(
    messages.slice(0, limit).map(async message => {
      const avatarUrl = getAvatarUrl(message.author.id, message.author.avatar);
      const { content, mentions, channels } = await processContent(message.content, message.mentions);

      return {
        id: message.id,
        author: { name: message.author.global_name, username: message.author.username, avatar: avatarUrl },
        content,
        mentions,
        channels,
        timestamp: message.timestamp,
        reactions: message.reactions?.map(reaction => {
          return {
            emoji: reaction.emoji.name,
            count: reaction.count,
          };
        }),
      };
    }),
  );

  return Response.json(
    { messages: output },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
  // Log in the bot
}
