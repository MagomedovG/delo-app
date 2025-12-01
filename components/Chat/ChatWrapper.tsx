import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateChatClient } from "stream-chat-expo";
import {
  chatApiKey,
  chatUserId,
  chatUserName,
  chatUserToken,
} from "./chatConfig";

const user = {
  id: chatUserId,
  name: chatUserName,
};

export const ChatWrapper = ({ children }) => {
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData: user,
    tokenOrProvider: chatUserToken,
  });

  if (!chatClient) {
    return (
      <SafeAreaView>
        <Text>Loading chat ...</Text>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};