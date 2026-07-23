import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Body, Loading } from "../../../src/components/ui";
import { useApplyJob, useJobDetail } from "../../../src/hooks/useCatalogDetail";
import { useAuth } from "../../../src/auth";
import { colors } from "../../../src/theme";

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
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-background p-4" edges={["top", "bottom"]}>
        <Text className="font-body-semi text-center text-ink-muted">Job listing not found.</Text>
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
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-6" edges={["top", "bottom"]}>
        <View className="h-16 w-16 items-center justify-center rounded-full bg-forest/15">
          <Ionicons name="checkmark-circle-outline" size={44} color={colors.forest} />
        </View>
        <Text className="mt-4 font-display text-2xl text-forest">Application Submitted!</Text>
        <Body secondary className="mt-2 text-center text-base">
          Your application for <Text className="font-body-semi text-foreground">{job.title}</Text> has been sent directly to {job.provider?.businessName || "the provider"}.
        </Body>
        <Pressable
          onPress={() => router.replace(`/jobs`)}
          className="mt-6 rounded-full bg-forest px-6 py-3 active:opacity-90"
        >
          <Text className="font-body-semi text-sm text-white">Back to Job Board</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Top Bar */}
      <View className="flex-row items-center justify-between border-b border-hairline bg-surface p-4">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-clay active:opacity-80"
        >
          <Ionicons name="arrow-back" size={20} color={colors.forest} />
        </Pressable>
        <Text className="font-body-semi text-base text-forest">Apply for Position</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-hairline bg-surface p-4">
          <Text className="font-body-semi text-xs uppercase text-ink-muted">Applying for</Text>
          <Text className="font-display text-lg text-forest">{job.title}</Text>
          {job.provider?.businessName ? (
            <Text className="font-body-medium text-sm text-ink-secondary">
              {job.provider.businessName}
            </Text>
          ) : null}
        </View>

        {/* Name */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Full Name *</Text>
          <TextInput
            placeholder="Dr. Ananya Sharma"
            placeholderTextColor={colors.inkMuted}
            value={fullName}
            onChangeText={setFullName}
            className="rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Email */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Email Address *</Text>
          <TextInput
            placeholder="ananya@ayurpass.com"
            placeholderTextColor={colors.inkMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Phone */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Phone Number</Text>
          <TextInput
            placeholder="+61 400 000 000"
            placeholderTextColor={colors.inkMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Years of Experience */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Years of Experience</Text>
          <TextInput
            placeholder="e.g. 5"
            placeholderTextColor={colors.inkMuted}
            keyboardType="number-pad"
            value={experienceYears}
            onChangeText={setExperienceYears}
            className="rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Resume URL */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Resume / Portfolio Link (Optional)</Text>
          <TextInput
            placeholder="https://drive.google.com/your-cv.pdf"
            placeholderTextColor={colors.inkMuted}
            autoCapitalize="none"
            value={resumeUrl}
            onChangeText={setResumeUrl}
            className="rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Cover Note */}
        <View className="gap-1.5">
          <Text className="font-body-semi text-sm text-foreground">Cover Note / Why you are a great fit</Text>
          <TextInput
            placeholder="Introduce yourself, your practice background, Panchakarma expertise, certifications..."
            placeholderTextColor={colors.inkMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={coverNote}
            onChangeText={setCoverNote}
            className="min-h-[120px] rounded-xl border border-hairline bg-surface px-4 py-3 font-body text-sm text-foreground"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={applyMutation.isPending}
          className="mt-2 items-center justify-center rounded-full bg-forest py-4 active:opacity-90"
        >
          {applyMutation.isPending ? (
            <Text className="font-body-semi text-base text-white">Submitting...</Text>
          ) : (
            <Text className="font-body-semi text-base text-white">Submit Application</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
