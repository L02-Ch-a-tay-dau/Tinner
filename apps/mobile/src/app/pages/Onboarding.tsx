import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, MapPin, Heart, Sparkles, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router";

const slides = [
  {
    icon: Sparkles,
    //color: "from-orange-400 to-orange-500",
    //bgColor: "bg-orange-50",
    title: "Discover Amazing Food",
    description: "Swipe through delicious dishes and find your next favorite meal",
    emoji: "🍕",
  },
  {
    icon: SlidersHorizontal,
    //color: "from-blue-400 to-blue-500",
    //bgColor: "bg-blue-50",
    title: "Smart Filters",
    description: "Customize your preferences with cuisine, dietary, price, and distance filters",
    emoji: "🔍",
  },
  {
    icon: MapPin,
    //color: "from-emerald-400 to-emerald-500",
    //bgColor: "bg-emerald-50",
    title: "Find Restaurants Nearby",
    description: "Explore restaurants on a map and get directions to your favorite places",
    emoji: "🗺️",
  },
  {
    icon: Heart,
    //color: "from-rose-400 to-rose-500",
    //bgColor: "bg-rose-50",
    title: "Save Your Favorites",
    description: "Create collections of dishes you love and access them anytime",
    emoji: "❤️",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem("onboardingCompleted", "true");
      navigate("/login");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/login");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-hidden">
      {/* Skip Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSkip}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon Circle with Gradient */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className={`relative w-40 h-40 mb-8 ${slide.bgColor} rounded-full flex items-center justify-center`}
            >
              {/* Gradient Icon Background */}
              <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${slide.color} opacity-10`} />

              {/* Emoji */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="text-7xl relative z-10"
              >
                {slide.emoji}
              </motion.span>

              {/* Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${
                    currentSlide === 0
                      ? "#fb923c, #f97316"
                      : currentSlide === 1
                      ? "#60a5fa, #3b82f6"
                      : currentSlide === 2
                      ? "#34d399, #10b981"
                      : "#fb7185, #f43f5e"
                  })`,
                }}
              />
            </motion.div>

            {/* Title and Description */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-900 mb-3"
              style={{ fontSize: "28px", lineHeight: "1.2" }}
            >
              {slide.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 max-w-sm px-4"
              style={{ fontSize: "16px", lineHeight: "1.5" }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="transition-all"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 h-2 bg-orange-500"
                  : "w-2 h-2 bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Next Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        <span className="text-base">
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </span>
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
