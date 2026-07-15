import { View, Text, StyleSheet } from "react-native";
import { colors, doshaColor, fonts } from "../theme";
import type { Dosha } from "../dosha";

const LABEL: Record<Dosha, string> = { vata: "Vata", pitta: "Pitta", kapha: "Kapha" };

function Meter({ dosha, value, primary }: { dosha: Dosha; value: number; primary: boolean }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.row}>
        <Text style={[styles.name, primary && { color: doshaColor[dosha] }]}>
          {LABEL[dosha]}
          {primary ? "  ·  primary" : ""}
        </Text>
        <Text style={styles.pct}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${value}%`, backgroundColor: doshaColor[dosha] }]}
        />
      </View>
    </View>
  );
}

export function DoshaMeterGroup({
  vata,
  pitta,
  kapha,
  primary,
}: {
  vata: number;
  pitta: number;
  kapha: number;
  primary: Dosha;
}) {
  return (
    <View>
      <Meter dosha="vata" value={vata} primary={primary === "vata"} />
      <Meter dosha="pitta" value={pitta} primary={primary === "pitta"} />
      <Meter dosha="kapha" value={kapha} primary={primary === "kapha"} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.foreground },
  pct: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSecondary },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.clay, overflow: "hidden" },
  fill: { height: 8, borderRadius: 999 },
});
