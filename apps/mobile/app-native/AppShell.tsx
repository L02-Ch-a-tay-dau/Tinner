import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabs } from "./components/BottomTabs";
import {
  getSuggestionsFromApi,
  loadFiltersFromApi,
  loginWithApi,
  saveFiltersToApi,
  saveRestaurantToApi,
  signupWithApi,
} from "./api";
import { getDesignFoods } from "./designData";
import { CollectionsScreen } from "./screens/CollectionsScreen";
import { FiltersScreen } from "./screens/FiltersScreen";
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
        setError("Location permission is off, showing suggestions near central Ho Chi Minh City.");
      }
    } catch (err) {
      setDeck([]);
      setError(err instanceof Error ? err.message : "Unable to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const mapFoods = useMemo(() => (token ? deck : []), [deck, token]);

  const signup = async () => {
    setLoading(true);
    setError("");
    try {
      await signupWithApi({
        username: signupUsername,
        email,
        password,
        confirmPassword: signupConfirmPassword,
        fullName: signupFullName,
      });
      setScreen("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await loginWithApi(email, password);
      setToken(response.token);
      setUser(response.profile);
      setLikedCount(0);
      setSkippedCount(0);
      const saved = await loadFiltersFromApi(response.token);
      setPreferences(saved);
      setScreen("swipe");
      await loadApiDeck(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
      void saveRestaurantToApi(token, current.restaurants[0].id, current.dishType).catch((err) => {
        setError(err instanceof Error ? err.message : "Could not save restaurant");
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
    setScreen("swipe");
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
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
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
          onUsernameChange={setSignupUsername}
          onEmailChange={setEmail}
          onFullNameChange={setSignupFullName}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setSignupConfirmPassword}
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
            user={user}
            onSwipeLeft={swipeLeft}
            onSwipeRight={swipeRight}
            onReset={resetDeck}
            onLogout={logout}
            onClosePanel={() => setLikedFood(null)}
          />
        )}

        {screen === "map" && (
          <MapScreen
            foods={mapFoods}
            searchQuery={mapSearch}
            onSearchChange={setMapSearch}
            onOpenFilters={() => setScreen("filters")}
            emptyHint={
              !token
                ? "Sign in to load nearby restaurants from the map (suggestions API)."
                : undefined
            }
          />
        )}

        {screen === "collections" && (
          <CollectionsScreen
            likedFoods={likedFoods}
            onStartSwiping={() => setScreen("swipe")}
            onRemove={(foodId) => setLikedFoods((items) => items.filter((item) => item.foodId !== foodId))}
            onClearAll={() => setLikedFoods([])}
            onSelectFood={selectLikedFood}
          />
        )}

        {screen === "filters" && (
          <FiltersScreen
            user={user}
            preferences={preferences}
            saving={saving}
            onChangePreferences={setPreferences}
            onReset={() => setPreferences(defaultPreferences)}
            onSave={savePreferences}
          />
        )}

        <BottomTabs active={screen} onChange={setScreen} />
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
