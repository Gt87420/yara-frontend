import React, { useEffect } from "react";
import { View, Button, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../firebase";
import { googleLogin } from "../../api/auth";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "1084341029105-n1nj8lkhn5h5fnvd9pacdf50hdssih5o.apps.googleusercontent.com",  // 👈 Web OAuth Client ID
    androidClientId: "1084341029105-p6nke61p333g2jf1pt4t4k22t9aoervo.apps.googleusercontent.com",
  });

  const [message, setMessage] = React.useState("");

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        signInWithCredential(auth, credential).then(async (userCred) => {
          const idToken = await userCred.user.getIdToken();
          const res = await googleLogin(idToken);
          setMessage(JSON.stringify(res.data, null, 2));
        });
      }
    }
  }, [response]);

  return (
    <View>
      <Button disabled={!request} title="Login con Google" onPress={() => promptAsync()} />
      <Text>{message}</Text>
    </View>
  );
}
