import React from "react"
import { View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

export default function TestIcon() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Ionicons name="home-outline" size={50} color="tomato" />
    </View>
  )
}
