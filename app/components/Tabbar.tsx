import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  active: string;
  onChange: (tab: string) => void;
};

export default function Tabbar({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange("home")} style={styles.tab}>
        <Ionicons
          name="home-outline"
          size={28}
          color={active === "home" ? "#3498db" : "#444"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange("friends")}
        style={styles.tab}
      >
        <View style={styles.friendsGroup}>
        <Ionicons
          name="person-outline"
          size={28}
          color={active === "friends" ? "#3498db" : "#444"}
          style={styles.iconBase}
        />

        <Ionicons
          name="person-outline"
          size={28}
          color={active === "friends" ? "#3498db" : "#444"}
          style={styles.iconOverlay}
        />
         <Ionicons
          name="person-outline"
          size={28}
          color={active === "friends" ? "#3498db" : "#444"}
          style={styles.iconThird}
        />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onChange("profile")} style={styles.tab}>
        <Ionicons
          name="person-outline"
          size={28}
          color={active === "profile" ? "#3498db" : "#444"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onChange("routes")} style={styles.tab}>
        <Ionicons
          name="bicycle-outline"
          size={28}
          color={active === "routes" ? "#3498db" : "#444"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    borderTopWidth: 1,
    borderTopColor: "#ddd",
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  friendsGroup: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBase: {
    position: "absolute",
    left: -8,
    top: 5,
    opacity: 0.9,
  },

  iconOverlay: {
    position: "absolute",
    left: 25,
    top: 5,
    opacity: 0.9,
  },

  iconThird: {
    position: "absolute",
    top: -5,
    right: 3,
    opacity: 0.9,
  }
});
