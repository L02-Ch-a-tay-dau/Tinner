import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SettingsGroup } from "../components/SettingsGroup";
import { SettingsRow } from "../components/SettingsRow";
import { colors, sharedStyles, shadow, spacing } from "../theme";
import type { UserProfile } from "../types";

interface ProfileScreenProps {
  user: UserProfile | null;
  savedCount: number;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  onOpenPreferences: () => void;
  onOpenSaved: () => void;
}

export function ProfileScreen({
  user,
  savedCount,
  onUpdateProfile,
  onLogout,
  onOpenPreferences,
  onOpenSaved,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");

  useEffect(() => {
    setEditName(user?.name ?? "");
  }, [user?.name]);

  const persistName = useCallback(
    (raw: string) => {
      if (!user) return;
      const trimmed = raw.trim();
      if (!trimmed || trimmed === user.name) return;
      onUpdateProfile({ ...user, name: trimmed });
    },
    [onUpdateProfile, user],
  );

  const openEdit = () => {
    setEditName(user?.name ?? "");
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditVisible(false);
  };

  const saveEdit = () => {
    persistName(editName);
    setEditVisible(false);
  };

  const displayName = user?.name?.trim() || "Khách";
  const username = user?.username ? `@${user.username}` : null;
  const email = user?.email ?? "";
  const initial = (displayName || email || "U").slice(0, 1).toUpperCase();

  const confirmLogout = () => {
    Alert.alert("Đăng xuất?", "Bạn sẽ cần đăng nhập lại để tiếp tục dùng Tinner.", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: onLogout },
    ]);
  };

  return (
    <View
      style={[
        sharedStyles.screen,
        { paddingBottom: spacing.navHeight + Math.max(12, insets.bottom + 8) },
      ]}
    >
      <View style={styles.pageHeader}>
        <Text style={sharedStyles.headerTitle}>Hồ sơ</Text>
        <Text style={sharedStyles.headerSubtitle}>Tài khoản của bạn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identityHeader}>
          <Pressable
            style={styles.avatarWrap}
            onPress={openEdit}
            accessibilityRole="button"
            accessibilityLabel="Chỉnh sửa ảnh đại diện"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>✎</Text>
            </View>
          </Pressable>

          <Text style={styles.displayName}>{displayName}</Text>
          {username ? <Text style={styles.username}>{username}</Text> : null}
          {email ? (
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          ) : null}

          <Pressable
            style={styles.editProfileButton}
            onPress={openEdit}
            accessibilityRole="button"
            accessibilityLabel="Chỉnh sửa hồ sơ"
          >
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </Pressable>
        </View>

        <SettingsGroup title="Tài khoản">
          <SettingsRow
            label="Tên hiển thị"
            value={displayName}
            onPress={openEdit}
          />
          <SettingsRow
            label="Tên đăng nhập"
            value={user?.username ? `@${user.username}` : "—"}
          />
          <SettingsRow label="Email" value={email || "—"} isLast />
        </SettingsGroup>

        <SettingsGroup title="Tùy chọn">
          <SettingsRow
            label="Sở thích món ăn"
            value="Ẩm thực và bộ lọc"
            onPress={onOpenPreferences}
          />
          <SettingsRow
            label="Bán kính tìm kiếm"
            onPress={onOpenPreferences}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Hoạt động">
          <SettingsRow
            label="Món đã lưu"
            value={String(savedCount)}
            onPress={onOpenSaved}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Bảo mật">
          <SettingsRow
            label="Đăng xuất"
            onPress={confirmLogout}
            showChevron={false}
            destructive
            isLast
          />
        </SettingsGroup>
      </ScrollView>

      <Modal animationType="slide" transparent visible={editVisible} onRequestClose={closeEdit}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
          keyboardVerticalOffset={Math.max(0, insets.bottom - 4)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeEdit} accessibilityLabel="Đóng" />
          <View style={[styles.editSheet, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.editTitle}>Chỉnh sửa hồ sơ</Text>
            <Text style={styles.editLabel}>Tên hiển thị</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nhập tên hiển thị"
              placeholderTextColor={colors.faint}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveEdit}
            />
            <View style={styles.actionRow}>
              <Pressable style={styles.cancelButton} onPress={closeEdit}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveText}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    paddingTop: 10,
    paddingBottom: 2,
  },
  content: {
    paddingTop: 6,
    paddingBottom: 32,
  },
  identityHeader: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.soft,
  },
  avatarText: {
    color: colors.orange,
    fontSize: 34,
    fontWeight: "800",
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  displayName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  username: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  email: {
    color: colors.faint,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
    maxWidth: "100%",
    paddingHorizontal: 16,
  },
  editProfileButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    minHeight: 44,
    justifyContent: "center",
    ...shadow.soft,
  },
  editProfileText: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  editSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.radius2xl,
    borderTopRightRadius: spacing.radius2xl,
    paddingHorizontal: spacing.screenX,
    paddingTop: 12,
    ...shadow.card,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 16,
  },
  editTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  editLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  editInput: {
    ...sharedStyles.input,
    fontSize: 16,
    minHeight: 46,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    minHeight: 44,
    minWidth: 76,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  cancelText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
  },
  saveButton: {
    minHeight: 44,
    minWidth: 88,
    borderRadius: spacing.radiusLg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.orange,
  },
  saveText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
