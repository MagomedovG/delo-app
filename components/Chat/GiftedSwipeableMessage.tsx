import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const MAX_SWIPE = 80;
const TRIGGER = 55;

export default function SwipeableMessage({ children, message, onReply }) {
  const offset = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);

  // Жест свайпа
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) return; // свайп влево (iMessage)

      const value = Math.max(e.translationX, -MAX_SWIPE);
      offset.value = value;

      arrowOpacity.value = Math.abs(value) / MAX_SWIPE;
    })
    .onEnd(() => {
      if (Math.abs(offset.value) > TRIGGER) {
        runOnJS(onReply)(message);
      }

      offset.value = withTiming(0, { duration: 150 });
      arrowOpacity.value = withTiming(0, { duration: 150 });
    });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateX: offset.value * 0.4 }],
  }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Стрелка */}
      <Animated.Text
        style={[
          {
            fontSize: 20,
            color: "#4D90FE",
            marginRight: 6,
            marginLeft: -22,
          },
          arrowStyle,
        ]}
      >
        ↩
      </Animated.Text>

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, bubbleStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
