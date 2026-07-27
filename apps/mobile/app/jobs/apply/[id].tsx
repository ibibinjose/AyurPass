import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Loading } from "../../../src/components/ui";
import { useApplyJob, useJobDetail } from "../../../src/hooks/useCatalogDetail";
import { useAuth } from "../../../src/auth";
import { colors, fonts } from "../../../src/theme";

export default function ApplyJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();

  const jobQ = useJobDetail(id);
  const applyMutation = useApplyJob();

  const [fullName, setFullName] = useState(auth.user?.fullName || "");
  const [email, setEmail] = useState(auth.user?.email || "");
  const [phone, setPhone] = useState(auth.user?.phone || "");
  const [experienceYears, setExperienceYears] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const job = jobQ.data;

  if (jobQ.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4" style={{ flex: 1, backgroundColor: colors.background, padding: 16 }} edges={["top", "bottom"]}>
        <Text style={{ fontFamily: fonts.bodySemi, textAlign: "center", color: colors.inkMuted }}>Job listing not found.</Text>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Missing Fields", "Please provide your full name and email address.");
      return;
    }

    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          coverNote: coverNote.trim() || undefined,
          resumeUrl: resumeUrl.trim() || undefined,
          experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
        },
      });
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message || "Could not submit application.");
    }
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }} edges={["top", "bottom"]}>
        <View style={{ height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "rgba(47,90,68,0.15)" }}>
          <Ionicons name="checkmark-circle-outline" size={44} color={colors.forest} />
        </View>
        <Text style={{ marginTop: 16, fontFamily: fonts.display, fontSize: 24, color: colors.forest }}>Application Submitted!</Text>
        <Body secondary style={{ marginTop: 8, textAlign: "center", fontSize: 15, color: colors.inkSecondary }}>
          Your application for <Text style={{ fontFamily: fonts.bodySemi, color: colors.foreground }}>{job.title}</Text> has been sent directly to {job.provider?.businessName || "the provider"}.
        </Body>
        <Pressable
          onPress={() => router.replace(`/jobs`)}
          style={{ marginTop: 24, borderRadius: 999, backgroundColor: colors.forest, paddingHorizontal: 24, paddingVertical: 12 }}
        >
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.white }}>Back to Job Board</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Header Banner */}
        <View style={{ position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.forestDeep, colors.forest, colors.leaf]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />

          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              zIndex: 20,
              height: 36,
              width: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>

          <View style={{ paddingTop: 32, zIndex: 10 }}>
            <Text style={{ fontSize: 13, color: colors.goldSoft, fontFamily: fonts.bodySemi }}>
              Apply for Position 💼
            </Text>
            <Text style={{ fontSize: 24, fontFamily: fonts.display, color: colors.white, marginTop: 2 }}>
              {job.title}
            </Text>
            {job.provider?.businessName ? (
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.goldSoft, marginTop: 2 }}>
                {job.provider.businessName}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {/* Name */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Full Name *</Text>
            <TextInput
              placeholder="Dr. Ananya Sharma"
              placeholderTextColor={colors.inkMuted}
              value={fullName}
              onChangeText={setFullName}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Email Address *</Text>
            <TextInput
              placeholder="ananya@ayurpass.com"
              placeholderTextColor={colors.inkMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Phone */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Phone Number</Text>
            <TextInput
              placeholder="+61 400 000 000"
              placeholderTextColor={colors.inkMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Years of Experience */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Years of Experience</Text>
            <TextInput
              placeholder="e.g. 5"
              placeholderTextColor={colors.inkMuted}
              keyboardType="number-pad"
              value={experienceYears}
              onChangeText={setExperienceYears}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Resume URL */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Resume / Portfolio Link (Optional)</Text>
            <TextInput
              placeholder="https://drive.google.com/your-cv.pdf"
              placeholderTextColor={colors.inkMuted}
              autoCapitalize="none"
              value={resumeUrl}
              onChangeText={setResumeUrl}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Cover Note */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.foreground }}>Cover Note / Why you are a great fit</Text>
            <TextInput
              placeholder="Introduce yourself, your practice background, Panchakarma expertise, certifications..."
              placeholderTextColor={colors.inkMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={coverNote}
              onChangeText={setCoverNote}
              style={{
                minHeight: 120,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.hairline,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={applyMutation.isPending}
            style={{
              marginTop: 8,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              backgroundColor: colors.forest,
              paddingVertical: 14,
            }}
          >
            {applyMutation.isPending ? (
              <Loading label="Submitting application…" />
            ) : (
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.white }}>Submit Application</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
