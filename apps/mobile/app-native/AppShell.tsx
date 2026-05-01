import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabs } from "./components/BottomTabs";
import { getSuggestionsFromApi, loginWithApi, saveRestaurantToApi } from "./api";
import { filterFoodsByPreferences, getDesignFoods } from "./designData";
import { CollectionsScreen } from "./screens/CollectionsScreen";
import { FiltersScreen } from "./screens/FiltersScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
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
const INITIAL_DISH = "pho";

function findFoodByLikedId(foodId: string, foods: NativeFood[]) {
  return foods.find((food) => food.id === foodId);
}

export function AppShell() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<ScreenName>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [error, setError] = useState("");

  const filteredDesignFoods = useMemo(
    () => filterFoodsByPreferences(DESIGN_FOODS, preferences),
    [preferences],
  );

  const mapFoods = useMemo(() => {
    if (deck.length > 0) return deck;
    return filteredDesignFoods;
  }, [deck, filteredDesignFoods]);

  const resetDeckFromDesign = useCallback(() => {
    setDeck([...filteredDesignFoods].reverse());
  }, [filteredDesignFoods]);

  const loadApiDeck = useCallback(async () => {
    if (!token) {
      resetDeckFromDesign();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getSuggestionsFromApi(token, INITIAL_DISH);
      const cards = result.cards.length > 0 ? result.cards : filteredDesignFoods;
      setDeck([...cards].reverse());
      if (result.usedFallback && cards.length > 0) {
        setError("Location permission is off, showing suggestions near central Ho Chi Minh City.");
      }
    } catch (err) {
      setDeck([...filteredDesignFoods].reverse());
      setError(err instanceof Error ? err.message : "Unable to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [filteredDesignFoods, resetDeckFromDesign, token]);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await loginWithApi(email, password);
      setToken(response.token);
      setUser(response.profile);
      setLikedCount(0);
      setSkippedCount(0);
      setScreen("swipe");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = () => {
    setToken("");
    setUser({ email: "guest@tinner.app", name: "Guest" });
    setError("");
    setLikedCount(0);
    setSkippedCount(0);
    setDeck([...filteredDesignFoods].reverse());
    setScreen("swipe");
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setDeck([]);
    setLikedFoods([]);
    setLikedFood(null);
    setEmail("");
    setPassword("");
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
      resetDeckFromDesign();
    }
    setSkippedCount(0);
    setLikedCount(0);
    setLikedFood(null);
  };

  const savePreferences = () => {
    resetDeckFromDesign();
    setScreen("swipe");
  };

  const selectLikedFood = (foodId: string) => {
    const fromDesign = findFoodByLikedId(foodId, DESIGN_FOODS);
    const fromDeck = findFoodByLikedId(foodId, deck);
    setLikedFood(fromDeck ?? fromDesign ?? null);
  };

  useEffect(() => {
    if (screen === "swipe" && user && deck.length === 0) {
      void loadApiDeck();
    }
  }, [deck.length, loadApiDeck, screen, user]);

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
          onGuestLogin={guestLogin}
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
