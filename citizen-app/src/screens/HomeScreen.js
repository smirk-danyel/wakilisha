import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

import { StatusBar } from "expo-status-bar";
import { Svg, Path, Circle, Line } from "react-native-svg";
import { useFonts } from "expo-font";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

// Original logo from the Stitch Home Screen
const LOGO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZSwzP6TdJdFk33e50T78bGux-GUr7ziMxWXbOSnk7FyIJ8xt-O6d_UxW3xV2FwBogMyrT1xmKgb50_KHJUk6Lx82NNXI07jKaapegOLRafEJ1RL5mWage4lwPsuAyVQQW6MEz9lZkY1mDHwR3hYtxOBFL68YMQMU9XCMjHI41Ht0vJBznJ0N33iuORnibXMuTBE5yEFpQyxaOYNTN-DNat6W803BhREtDjQ_5KuSAUBgYEM5YPL5f";

// Emergency categories and their corresponding database names
const EMERGENCY_TYPES = [
  {
    id: "medical",
    label: "Medical",
    backendType: "Medical Emergency",
    icon: "medical",
    color: "#10B981",
    background: "#ECFDF5",
    border: "#D1FAE5",
  },
  {
    id: "fire",
    label: "Fire",
    backendType: "Fire",
    icon: "fire",
    color: "#EF4444",
    background: "#FEF2F2",
    border: "#FEE2E2",
  },
  {
    id: "accident",
    label: "Accident",
    backendType: "Road Traffic Accident",
    icon: "accident",
    color: "#F97316",
    background: "#FFF7ED",
    border: "#FFEDD5",
  },
  {
    id: "crime",
    label: "Crime",
    backendType: "Crime and Security",
    icon: "crime",
    color: "#4F46E5",
    background: "#EEF2FF",
    border: "#E0E7FF",
  },
  {
    id: "rescue",
    label: "Rescue",
    backendType: "Rescue",
    icon: "rescue",
    color: "#175349",
    background: "#E8F3F1",
    border: "#C2DFDA",
  },
  {
    id: "hazard",
    label: "Hazard",
    backendType: "Hazard and Infrastructure",
    icon: "hazard",
    color: "#D97706",
    background: "#FFFBEB",
    border: "#FEF3C7",
  },
  {
    id: "other",
    label: "Other Emergency",
    backendType: "Other Emergency",
    icon: "other",
    color: "#8B5CF6",
    background: "#FAF5FF",
    border: "#EDE9FE",
  },
];

// Reusable native SVG icons
function AppIcon({ name, color = "#175349", size = 22 }) {
  const common = {
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "medical" && <Path d="M12 4v16m-8-8h16" {...common} />}

      {name === "fire" && (
        <Path
          d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"
          {...common}
        />
      )}

      {name === "accident" && (
        <>
          <Path
            d="M5 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
            {...common}
          />
          <Path d="M3 13l2-5h10l2 3h3a1 1 0 0 1 1 1v2H3v-1z" {...common} />
          <Path d="M14 6l2-3m-6 3-1-3" {...common} />
        </>
      )}

      {name === "crime" && (
        <>
          {/* Hood outline */}
          <Path
            d="M12 3c-4.1 0-7.2 3.2-7.2 7.4v2.1c0 1.1.5 2.1 1.4 2.8l1.2 5.3c.2.8.9 1.4 1.7 1.4h5.8c.8 0 1.5-.6 1.7-1.4l1.2-5.3c.9-.7 1.4-1.7 1.4-2.8v-2.1C19.2 6.2 16.1 3 12 3Z"
            {...common}
          />

          {/* Face opening */}
          <Path d="M7.1 11c1.1-1 2.7-1.5 4.9-1.5s3.8.5 4.9 1.5" {...common} />

          {/* Eyes */}
          <Path d="M8.6 12.2h2m2.8 0h2" {...common} />

          {/* Face covering */}
          <Path d="M8.8 14.1c.9.6 2 .9 3.2.9s2.3-.3 3.2-.9" {...common} />
        </>
      )}

      {name === "rescue" && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Circle cx="12" cy="12" r="4" {...common} />
          <Path
            d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m-14.14 0 4.24-4.24m5.66-5.66 4.24-4.24"
            {...common}
          />
        </>
      )}

      {name === "hazard" && (
        <>
          <Path
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            {...common}
          />
          <Path d="M12 9v4m0 4h.01" {...common} />
        </>
      )}

      {name === "other" && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Path d="M12 8v4m0 4h.01" {...common} />
        </>
      )}

      {name === "location" && (
        <>
          <Circle cx="12" cy="12" r="8" {...common} />
          <Circle cx="12" cy="12" r="3" {...common} />
          <Path d="M12 2v3m0 14v3M2 12h3m14 0h3" {...common} />
        </>
      )}

      {name === "microphone" && (
        <>
          <Path
            d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
            {...common}
          />
          <Path d="M19 10v2a7 7 0 0 1-14 0v-2" {...common} />
          <Line x1="12" y1="19" x2="12" y2="22" {...common} />
          <Line x1="8" y1="22" x2="16" y2="22" {...common} />
        </>
      )}

      {name === "camera" && (
        <>
          <Path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            {...common}
          />
          <Circle cx="12" cy="13" r="4" {...common} />
        </>
      )}

      {name === "gallery" && (
        <>
          <Path d="M3 3h18v18H3z" {...common} />
          <Circle cx="8.5" cy="8.5" r="1.5" {...common} />
          <Path d="m21 15-5-5L5 21" {...common} />
        </>
      )}
    </Svg>
  );
}

function EmergencyCard({ item, selected, onPress }) {
  const isOther = item.id === "other";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.emergencyCard,
        isOther && styles.otherEmergencyCard,
        selected && styles.emergencyCardSelected,
      ]}
    >
      <View
        style={[
          styles.emergencyIconBox,
          {
            backgroundColor: item.background,
            borderColor: item.border,
          },
        ]}
      >
        <AppIcon name={item.icon} color={item.color} size={20} />
      </View>

      <View style={isOther && styles.otherEmergencyText}>
        <Text style={styles.emergencyLabel}>{item.label}</Text>

        {isOther && (
          <Text style={styles.emergencySubtext}>
            Report any unlisted incident directly
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function HomeScreen({
  onUseLocation = undefined,
  onRecordAudio = undefined,
  onTakePhoto = undefined,
  onChooseImage = undefined,
  onSubmitReport,
}) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [selectedType, setSelectedType] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  // CAMERA
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  // GALLERY
  const [isChoosingImage, setIsChoosingImage] = useState(false);

  const [gpsCoordinates, setGpsCoordinates] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  // AUDIO RECORDER
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const recorderState = useAudioRecorderState(audioRecorder, 250);

  // AUDIO PLAYBACK
  const audioPlayer = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(audioPlayer);

  const [recordedAudioUri, setRecordedAudioUri] = useState(null);
  const [recordedAudioDuration, setRecordedAudioDuration] = useState(0);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const handleUseLocation = async () => {
    if (isGettingLocation) return;

    try {
      setIsGettingLocation(true);

      // Check whether phone location services are enabled.
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        if (Platform.OS === "android") {
          try {
            await Location.enableNetworkProviderAsync();
          } catch {
            Alert.alert(
              "Location services are off",
              "Please turn on Location in your phone settings and try again.",
            );
            return;
          }
        } else {
          Alert.alert(
            "Location services are off",
            "Please enable location services and try again.",
          );
          return;
        }
      }

      // Check existing foreground permission.
      let permission = await Location.getForegroundPermissionsAsync();

      // Request permission if it hasn't already been granted.
      if (permission.status !== "granted") {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== "granted") {
        if (permission.canAskAgain) {
          Alert.alert(
            "Location permission required",
            "Allow Wakilisha to access your location while using the app. You can also enter your location manually.",
          );
        } else {
          Alert.alert(
            "Location permission denied",
            "Enable location permission for Wakilisha in your phone settings, or enter your location manually.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
            ],
          );
        }

        return;
      }

      // Retrieve current GPS position.
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });

      const coordinates = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      // Preserve exact coordinates for API submission.
      setGpsCoordinates(coordinates);

      // Fallback if an address cannot be resolved.
      let locationText =
        `GPS coordinates: ${coordinates.latitude.toFixed(6)}, ` +
        `${coordinates.longitude.toFixed(6)}`;

      // Attempt to convert GPS coordinates into a readable address.
      try {
        const addresses = await Location.reverseGeocodeAsync(coordinates);
        const address = addresses?.[0];

        if (address) {
          const parts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.region,
          ].filter(Boolean);

          const uniqueParts = [...new Set(parts)];

          if (uniqueParts.length > 0) {
            locationText = uniqueParts.join(", ");
          }
        }
      } catch (geocodingError) {
        console.warn("Address lookup unavailable:", geocodingError);
      }

      // Populate the existing location input.
      setLocation(locationText);

      Alert.alert(
        "Location captured",
        "Your current location has been added successfully.",
      );
    } catch (error) {
      console.error("Location error:", error);

      Alert.alert(
        "Unable to get your location",
        "Please check your GPS settings and try again, or enter your location manually.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };
  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const submitReport = () => {
    if (!onSubmitReport) return;

    const selectedEmergency = EMERGENCY_TYPES.find(
      (item) => item.id === selectedType,
    );

    if (!selectedEmergency) {
      Alert.alert(
        "Missing information",
        "Please select an emergency category.",
      );
      return;
    }

    if (!/^0[17]\d{8}$/.test(phone.trim())) {
      Alert.alert(
        "Invalid phone number",
        "Enter a valid Kenyan mobile number, e.g. 0712345678.",
      );
      return;
    }

    const hasLocation =
      location.trim() ||
      (gpsCoordinates?.latitude != null && gpsCoordinates?.longitude != null);

    if (!hasLocation) {
      Alert.alert("Missing location", "Please enter your location or use GPS.");
      return;
    }

    if (!description.trim() && !recordedAudioUri) {
      Alert.alert(
        "Missing report details",
        "Please describe the emergency or record a voice message.",
      );
      return;
    }

    onSubmitReport({
      emergencyType: selectedEmergency.backendType,
      location,
      description,
      imageUri: capturedImageUri,
      phone,
      latitude: gpsCoordinates?.latitude ?? null,
      longitude: gpsCoordinates?.longitude ?? null,
      audioUri: recordedAudioUri,
      audioDurationSeconds: recordedAudioUri ? recordedAudioDuration : null,
    });
  };

  const handleToggleRecording = async () => {
    if (isPreparingRecording) return;

    setIsPreparingRecording(true);

    try {
      if (recorderState.isRecording) {
        const durationSeconds = Math.max(
          1,
          Math.round(recorderState.durationMillis / 1000),
        );

        await audioRecorder.stop();

        const uri = audioRecorder.uri;

        if (!uri) throw new Error("The recording file could not be saved.");

        setRecordedAudioUri(uri);
        setRecordedAudioDuration(durationSeconds);

        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });

        audioPlayer.replace(uri);

        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Allow Wakilisha to access your microphone to record an emergency voice message.",
        );
        return;
      }

      audioPlayer.pause();
      audioPlayer.replace(null);

      setRecordedAudioUri(null);
      setRecordedAudioDuration(0);

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Audio recording error:", error);

      Alert.alert(
        "Recording error",
        "Unable to record your voice message. Please try again.",
      );
    } finally {
      setIsPreparingRecording(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isTakingPhoto) return;

    try {
      setIsTakingPhoto(true);

      // Request camera permission
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission required",
          "Allow Wakilisha to access your camera to photograph emergency evidence.",
        );
        return;
      }

      // Open the phone's camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
        exif: false,
      });

      // Save the captured photograph
      if (!result.canceled && result.assets?.length > 0) {
        setCapturedImageUri(result.assets[0].uri);

        Alert.alert(
          "Photo captured",
          "Your emergency evidence photo has been added.",
        );
      }
    } catch (error) {
      console.error("Camera error:", error);

      Alert.alert(
        "Camera error",
        "Unable to capture a photo. Please try again.",
      );
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleChooseImage = async () => {
    if (isChoosingImage) return;

    try {
      setIsChoosingImage(true);

      // Open the phone's image gallery.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
        exif: false,
      });

      // Save the selected image.
      if (!result.canceled && result.assets?.length > 0) {
        setCapturedImageUri(result.assets[0].uri);

        Alert.alert(
          "Photo selected",
          "Your gallery photo has been added as emergency evidence.",
        );
      }
    } catch (error) {
      console.error("Gallery error:", error);

      Alert.alert(
        "Gallery error",
        "Unable to select a photo. Please try again.",
      );
    } finally {
      setIsChoosingImage(false);
    }
  };

  const handleTogglePlayback = async () => {
    if (!recordedAudioUri) return;

    try {
      // Pause if the recording is currently playing.
      if (playerStatus.playing) {
        audioPlayer.pause();
        return;
      }

      // Ensure the audio session is configured for playback.
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      // Restart from the beginning if playback has finished.
      if (
        playerStatus.didJustFinish ||
        (playerStatus.duration > 0 &&
          playerStatus.currentTime >= playerStatus.duration)
      ) {
        await audioPlayer.seekTo(0);
      }

      audioPlayer.play();
    } catch (error) {
      console.error("Audio playback error:", error);

      Alert.alert(
        "Playback error",
        "Unable to play your recorded voice message. Please try again.",
      );
    }
  };

  const handleRemoveRecording = () => {
    audioPlayer.pause();
    audioPlayer.replace(null);

    setRecordedAudioUri(null);
    setRecordedAudioDuration(0);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <StatusBar hidden />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brandName}>WAKILISHA</Text>
              <Text style={styles.cityName}>Eldoret City</Text>
            </View>

            <View style={styles.headerLogoFrame}>
              <Image
                source={{ uri: LOGO_URI }}
                style={styles.headerLogo}
                resizeMode="contain"
                accessibilityLabel="Wakilisha Logo"
              />
            </View>
          </View>

          <View style={styles.sloganContainer}>
            <Text style={styles.slogan}>YOUR SAFETY,{"\n"}ONE TAP AWAY!</Text>

            <Text style={styles.headerDescription}>
              Direct line to police in Eldoret city within your location.
            </Text>
          </View>
        </View>

        {/* EMERGENCY TYPE */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Type</Text>

          <View style={styles.emergencyGrid}>
            {EMERGENCY_TYPES.map((item) => (
              <EmergencyCard
                key={item.id}
                item={item}
                selected={selectedType === item.id}
                onPress={() => setSelectedType(item.id)}
              />
            ))}
          </View>
        </View>

        {/* YOUR LOCATION */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Your Location</Text>

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Briefly describe where you are, e.g. near Kapsoya Shopping Centre, next to the petrol station"
            placeholderTextColor="#9E9E9E"
            multiline
            textAlignVertical="top"
            style={[styles.textInput, styles.locationInput]}
          />

          <Pressable
            disabled={isGettingLocation}
            onPress={handleUseLocation}
            accessibilityRole="button"
            accessibilityState={{ busy: isGettingLocation }}
            style={[
              styles.locationButton,
              isGettingLocation && { opacity: 0.7 },
            ]}
          >
            {isGettingLocation ? (
              <>
                <ActivityIndicator size="small" color="#175349" />
                <Text style={styles.locationButtonText}>
                  Getting your location...
                </Text>
              </>
            ) : (
              <>
                <AppIcon name="location" color="#175349" size={21} />
                <Text style={styles.locationButtonText}>
                  Use my phone's location instead
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* DESCRIBE WHAT'S HAPPENING */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Describe What's Happening</Text>

          <View style={styles.descriptionRow}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe what is happening, e.g. a vehicle has crashed and people are injured"
              placeholderTextColor="#9E9E9E"
              multiline
              textAlignVertical="top"
              style={[styles.textInput, styles.descriptionInput]}
            />

            <Pressable
              disabled={isPreparingRecording}
              onPress={handleToggleRecording}
              accessibilityRole="button"
              accessibilityLabel={
                recorderState.isRecording
                  ? "Stop voice recording"
                  : "Start voice recording"
              }
              style={[
                styles.recordButton,
                recorderState.isRecording && styles.recordButtonRecording,
                isPreparingRecording && { opacity: 0.7 },
              ]}
            >
              <AppIcon name="microphone" color="#FFFFFF" size={25} />
            </Pressable>
          </View>
          {/* VOICE RECORDING STATUS */}
          {(recorderState.isRecording || recordedAudioUri) && (
            <View style={styles.recordingStatus}>
              <View
                style={[
                  styles.recordingDot,
                  !recorderState.isRecording && styles.recordedDot,
                ]}
              />

              <View style={styles.recordingInfo}>
                <Text style={styles.recordingStatusTitle}>
                  {recorderState.isRecording
                    ? "Recording voice message"
                    : "Voice message recorded"}
                </Text>

                <Text style={styles.recordingDuration}>
                  {formatDuration(
                    recorderState.isRecording
                      ? recorderState.durationMillis
                      : recordedAudioDuration * 1000,
                  )}
                </Text>
              </View>

              {!recorderState.isRecording && recordedAudioUri && (
                <Pressable
                  onPress={handleTogglePlayback}
                  disabled={!playerStatus.isLoaded}
                  accessibilityRole="button"
                  style={[
                    styles.playbackButton,
                    !playerStatus.isLoaded && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.playbackButtonText}>
                    {!playerStatus.isLoaded
                      ? "Loading..."
                      : playerStatus.playing
                        ? "Pause"
                        : playerStatus.didJustFinish
                          ? "Replay"
                          : "Play"}
                  </Text>
                </Pressable>
              )}

              {!recorderState.isRecording && (
                <Pressable
                  onPress={handleRemoveRecording}
                  accessibilityRole="button"
                >
                  <Text style={styles.removeRecordingText}>Remove</Text>
                </Pressable>
              )}
            </View>
          )}
          {/* ADD EVIDENCE */}
          <View style={styles.evidenceSection}>
            <Text style={styles.evidenceTitle}>Add Evidence</Text>

            <View style={styles.evidenceGrid}>
              <Pressable
                disabled={isTakingPhoto}
                onPress={handleTakePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
                style={[
                  styles.evidenceButton,
                  isTakingPhoto && { opacity: 0.6 },
                ]}
              >
                {isTakingPhoto ? (
                  <ActivityIndicator size="small" color="#175349" />
                ) : (
                  <AppIcon name="camera" color="#175349" size={24} />
                )}
              </Pressable>

              <Pressable
                disabled={isChoosingImage}
                onPress={handleChooseImage}
                accessibilityRole="button"
                accessibilityLabel="Upload from gallery"
                style={[
                  styles.evidenceButton,
                  isChoosingImage && { opacity: 0.6 },
                ]}
              >
                {isChoosingImage ? (
                  <ActivityIndicator size="small" color="#175349" />
                ) : (
                  <AppIcon name="gallery" color="#175349" size={24} />
                )}
              </Pressable>
            </View>
            {capturedImageUri && (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />

                <View style={styles.photoPreviewInfo}>
                  <Text style={styles.photoPreviewTitle}>Photo attached</Text>

                  <Text style={styles.photoPreviewSubtitle}>
                    Emergency evidence
                  </Text>
                </View>

                <Pressable
                  onPress={() => setCapturedImageUri(null)}
                  accessibilityRole="button"
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* PHONE NUMBER */}
          <View style={styles.phoneSection}>
            <Text style={styles.sectionTitle}>Your Phone Number</Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number, e.g. 0712345678"
              placeholderTextColor="#9E9E9E"
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.textInput, styles.phoneInput]}
            />
          </View>

          {/* SUBMIT REPORT */}
          <Pressable
            disabled={!onSubmitReport}
            onPress={submitReport}
            accessibilityRole="button"
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photoPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F7F6",
    borderWidth: 1,
    borderColor: "#D3E2DF",
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },

  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },

  photoPreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },

  photoPreviewTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#175349",
  },

  photoPreviewSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 3,
  },

  removePhotoText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#DC2626",
    padding: 6,
  },
  playbackButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#175349",
    marginRight: 6,
  },

  playbackButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#175349",
  },
  recordButtonRecording: {
    backgroundColor: "#DC2626",
  },

  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F7F6",
    borderWidth: 1,
    borderColor: "#D3E2DF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },

  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#DC2626",
  },

  recordedDot: {
    backgroundColor: "#175349",
  },

  recordingInfo: {
    flex: 1,
    marginLeft: 10,
  },

  recordingStatusTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#1A1A1A",
  },

  recordingDuration: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  removeRecordingText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#DC2626",
    padding: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 0,
  },

  // HEADER
  header: {
    backgroundColor: "#175349",
    marginHorizontal: 12,
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderRadius: 28,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  brandName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    letterSpacing: 0.96,
    color: "rgba(255,255,255,0.8)",
  },

  cityName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 2,
    lineHeight: 24,
  },

  headerLogoFrame: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    overflow: "hidden",
  },

  headerLogo: {
    width: 34,
    height: 34,
  },

  sloganContainer: {
    marginTop: 28,
  },

  slogan: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 29.12,
  },

  headerDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    lineHeight: 18,
  },

  // GENERAL SECTION HEADINGS
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#1A1A1A",
  },

  // EMERGENCY TYPE
  emergencySection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },

  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },

  emergencyCard: {
    width: "48.1%",
    height: 68,
    backgroundColor: "#F3F6F9",
    borderRadius: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  emergencyCardSelected: {
    backgroundColor: "#E1E5E9",
    borderColor: "#B8C1CA",
  },

  otherEmergencyCard: {
    width: "100%",
  },

  emergencyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },

  emergencyLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 18,
    flexShrink: 1,
  },

  otherEmergencyText: {
    flexDirection: "column",
    flex: 1,
  },

  emergencySubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 1,
  },

  // YOUR LOCATION
  locationSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D3E2DF",
    borderRadius: 16,
    color: "#1A1A1A",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    padding: 12,
  },

  locationInput: {
    height: 64,
    marginTop: 10,
  },

  locationButton: {
    height: 48,
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#175349",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  locationButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#175349",
    letterSpacing: -0.25,
  },

  // DESCRIPTION
  descriptionSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },

  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
  },

  descriptionInput: {
    flex: 1,
    height: 96,
    padding: 14,
    lineHeight: 19,
  },

  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#175349",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  // EVIDENCE
  evidenceSection: {
    marginTop: 16,
  },

  evidenceTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#1A1A1A",
    marginBottom: 8,
  },

  evidenceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  evidenceButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#175349",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  // PHONE NUMBER
  phoneSection: {
    marginTop: 24,
  },

  phoneInput: {
    height: 56,
    marginTop: 10,
    paddingHorizontal: 16,
    fontSize: 13,
  },

  // SUBMIT
  submitButton: {
    height: 56,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#175349",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#175349",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  submitButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
