import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabs } from "./components/BottomTabs";
import {
  deleteSavedFromApi,
  fetchMeFromApi,
  fetchSavedFromApi,
  getSuggestionsFromApi,
  loadFiltersFromApi,
  loginWithApi,
  saveFiltersToApi,
  saveRestaurantToApi,
  signupWithApi,
} from "./api";
import { validateLogin, validateSignup } from "./auth-validation";
import { getDesignFoods } from "./designData";
import { CollectionsScreen } from "./screens/CollectionsScreen";
import { FiltersScreen } from "./screens/FiltersScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { SwipeScreen } from "./screens/SwipeScreen";
import { colors } from "./theme";
import {
  defaultPreferences,
  type LikedFood,
  type NativeFood,
  type ScreenName,
  type UserPreferences,
  type UserProfile,
} from "./types";

const DESIGN_FOODS = getDesignFoods();

function findFoodByLikedId(foodId: string, foods: NativeFood[]) {
  return foods.find((food) => food.id === foodId);
}

export function AppShell() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<ScreenName>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [deck, setDeck] = useState<NativeFood[]>([]);
  const [likedFoods, setLikedFoods] = useState<LikedFood[]>([]);
  const [likedFood, setLikedFood] = useState<NativeFood | null>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [likedCount, setLikedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preferencesReturnScreen, setPreferencesReturnScreen] = useState<ScreenName>("swipe");

  const loadApiDeck = useCallback(async (authToken?: string) => {
    const effectiveToken = authToken ?? token;
    if (!effectiveToken) {
      setDeck([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getSuggestionsFromApi(effectiveToken);
      setDeck([...result.cards].reverse());
      if (result.usedFallback && result.cards.length > 0) {
        setError("Bạn chưa bật vị trí. Đang hiển thị gợi ý quanh trung tâm TP.HCM.");
      }
    } catch (err) {
      setDeck([]);
      setError(err instanceof Error ? err.message : "Không thể tải gợi ý lúc này.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const mapFoods = useMemo(() => (token ? deck : []), [deck, token]);

  const loadSavedCollections = useCallback(async (authToken: string) => {
    try {
      const saved = await fetchSavedFromApi(authToken);
      setLikedFoods(saved);
    } catch {
      setLikedFoods([]);
    }
  }, []);

  const signup = async () => {
    const validationError = validateSignup({
      username: signupUsername,
      email,
      password,
      confirmPassword: signupConfirmPassword,
      fullName: signupFullName,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const trimmedFullName = signupFullName.trim();
      await signupWithApi({
        username: signupUsername.trim(),
        email: email.trim(),
        password,
        confirmPassword: signupConfirmPassword,
        ...(trimmedFullName ? { fullName: trimmedFullName } : {}),
      });
      setScreen("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await loginWithApi(email.trim(), password);
      setToken(response.token);
      setLikedCount(0);
      setSkippedCount(0);
      setScreen("swipe");

      try {
        const profile = await fetchMeFromApi(response.token);
        setUser(profile);
      } catch {
        setUser(response.profile);
      }

      try {
        const savedFilters = await loadFiltersFromApi(response.token);
        setPreferences(savedFilters);
      } catch {
        // Keep default preferences if filters cannot be loaded yet.
      }

      void loadSavedCollections(response.token);
      void loadApiDeck(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const clearErrorOnChange = useCallback(
    (setter: (value: string) => void) => (value: string) => {
      if (error) {
        setError("");
      }
      setter(value);
    },
    [error],
  );

  const logout = () => {
    setToken("");
    setUser(null);
    setDeck([]);
    setLikedFoods([]);
    setLikedFood(null);
    setEmail("");
    setPassword("");
    setSignupUsername("");
    setSignupFullName("");
    setSignupConfirmPassword("");
    setError("");
    setScreen("login");
  };

  const swipeRight = () => {
    const current = deck.at(-1);
    if (!current) return;

    setLikedFood(current);
    setLikedCount((value) => value + 1);
    setLikedFoods((items) => [
      {
        foodId: current.id,
        foodName: current.name,
        cuisine: current.cuisine,
        likedAt: new Date().toISOString(),
        image: current.image,
        description: current.description,
        tags: current.tags,
        dishType: current.dishType,
        calories: current.calories,
        cardStats: current.cardStats,
        restaurants: current.restaurants,
      },
      ...items.filter((item) => item.foodId !== current.id),
    ]);

    if (token && current.restaurants[0]) {
      void saveRestaurantToApi(token, current.restaurants[0].id, current.dishType)
        .then(() => loadSavedCollections(token))
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể lưu nhà hàng.");
        });
    }

    setDeck((items) => items.slice(0, -1));
  };

  const swipeLeft = () => {
    if (deck.length === 0) return;
    setSkippedCount((value) => value + 1);
    setDeck((items) => items.slice(0, -1));
  };

  const resetDeck = () => {
    if (token) {
      void loadApiDeck();
    } else {
      setDeck([]);
    }
    setSkippedCount(0);
    setLikedCount(0);
    setLikedFood(null);
  };

  const resolveReturnScreen = (from: ScreenName): ScreenName =>
    from === "map" ? "swipe" : from;

  const openPreferences = (from: ScreenName) => {
    setPreferencesReturnScreen(resolveReturnScreen(from));
    setScreen("preferences");
  };

  const handleTabChange = (next: ScreenName) => {
    if (next === "map") {
      setScreen("swipe");
      return;
    }
    setScreen(next);
  };

  const savePreferences = async () => {
    setSaving(true);
    if (token) {
      try {
        await saveFiltersToApi(token, preferences);
      } catch {
        // Filters save failed silently — deck reload will use previous filters
      }
      await loadApiDeck();
    } else {
      setDeck([]);
    }
    setSaving(false);
    setScreen(resolveReturnScreen(preferencesReturnScreen));
  };

  const removeSavedFood = (foodId: string) => {
    const target = likedFoods.find((item) => item.foodId === foodId);
    setLikedFoods((items) => items.filter((item) => item.foodId !== foodId));
    if (likedFood?.id === foodId) {
      setLikedFood(null);
    }
    if (token && target?.interactionId) {
      void deleteSavedFromApi(token, target.interactionId).catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể xóa mục đã lưu.");
      });
    }
  };

  const clearAllSaved = () => {
    const toDelete = likedFoods.filter((item) => item.interactionId);
    setLikedFoods([]);
    setLikedFood(null);
    if (token) {
      for (const item of toDelete) {
        if (item.interactionId) {
          void deleteSavedFromApi(token, item.interactionId).catch(() => undefined);
        }
      }
    }
  };

  const selectLikedFood = (foodId: string) => {
    const fromLikes = likedFoods.find((f) => f.foodId === foodId);
    if (fromLikes?.restaurants?.length) {
      setLikedFood({
        id: fromLikes.foodId,
        name: fromLikes.foodName,
        cuisine: fromLikes.cuisine,
        description: fromLikes.description ?? "",
        image: fromLikes.image,
        calories: fromLikes.calories ?? "Restaurant",
        cardStats: fromLikes.cardStats,
        tags: fromLikes.tags ?? [],
        dishType: fromLikes.dishType ?? fromLikes.cuisine,
        restaurants: fromLikes.restaurants,
      });
      return;
    }
    const fromDesign = findFoodByLikedId(foodId, DESIGN_FOODS);
    const fromDeck = findFoodByLikedId(foodId, deck);
    setLikedFood(fromDeck ?? fromDesign ?? null);
  };

  if (screen === "login") {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: Math.max(12, insets.bottom) }]}>
        <StatusBar style="dark" />
        <LoginScreen
          email={email}
          password={password}
          error={error}
          loading={loading}
          onEmailChange={clearErrorOnChange(setEmail)}
          onPasswordChange={clearErrorOnChange(setPassword)}
          onLogin={() => void login()}
          onGoToSignup={() => {
            setError("");
            setScreen("signup");
          }}
        />
      </View>
    );
  }

  if (screen === "signup") {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: Math.max(12, insets.bottom) }]}>
        <StatusBar style="dark" />
        <SignupScreen
          username={signupUsername}
          email={email}
          fullName={signupFullName}
          password={password}
          confirmPassword={signupConfirmPassword}
          error={error}
          loading={loading}
          onUsernameChange={clearErrorOnChange(setSignupUsername)}
          onEmailChange={clearErrorOnChange(setEmail)}
          onFullNameChange={clearErrorOnChange(setSignupFullName)}
          onPasswordChange={clearErrorOnChange(setPassword)}
          onConfirmPasswordChange={clearErrorOnChange(setSignupConfirmPassword)}
          onSubmit={() => void signup()}
          onGoToLogin={() => {
            setError("");
            setScreen("login");
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        {screen === "swipe" && (
          <SwipeScreen
            deck={deck}
            loading={loading}
            error={error}
            likedCount={likedCount}
            skippedCount={skippedCount}
            selectedFood={likedFood}
            onSwipeLeft={swipeLeft}
            onSwipeRight={swipeRight}
            onReset={resetDeck}
            onClosePanel={() => setLikedFood(null)}
            onOpenFilters={() => openPreferences("swipe")}
          />
        )}

        {screen === "map" && (
          <MapScreen
            foods={mapFoods}
            searchQuery={mapSearch}
            onSearchChange={setMapSearch}
            onOpenFilters={() => openPreferences("map")}
            emptyHint={
              !token
                ? "Hãy đăng nhập để tải các nhà hàng gần bạn trên bản đồ."
                : undefined
            }
          />
        )}

        {screen === "collections" && (
          <CollectionsScreen
            likedFoods={likedFoods}
            selectedFood={likedFood}
            onStartSwiping={() => setScreen("swipe")}
            onRemove={removeSavedFood}
            onClearAll={clearAllSaved}
            onSelectFood={selectLikedFood}
            onClosePanel={() => setLikedFood(null)}
          />
        )}

        {screen === "filters" && (
          <ProfileScreen
            user={user}
            savedCount={likedFoods.length}
            onUpdateProfile={setUser}
            onLogout={logout}
            onOpenPreferences={() => setScreen("preferences")}
            onOpenSaved={() => setScreen("collections")}
          />
        )}

        {screen === "preferences" && (
          <FiltersScreen
            user={user}
            preferences={preferences}
            saving={saving}
            onChangePreferences={setPreferences}
            onReset={() => setPreferences(defaultPreferences)}
            onSave={savePreferences}
          />
        )}

        <BottomTabs active={screen === "map" ? "swipe" : screen} onChange={handleTabChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    backgroundColor: colors.background,
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
  },
});
