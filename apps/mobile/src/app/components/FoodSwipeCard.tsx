import { useState } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "motion/react";
import { Heart, X, Flame } from "lucide-react";
import { Food } from "../data/foods";

interface FoodSwipeCardProps {
  food: Food;
  isTop: boolean;
  stackIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SWIPE_THRESHOLD = 100;

export function FoodSwipeCard({
  food,
  isTop,
  stackIndex,
  onSwipeLeft,
  onSwipeRight,
}: FoodSwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const likeScale = useTransform(x, [20, 100], [0.8, 1]);
  const nopeScale = useTransform(x, [-100, -20], [1, 0.8]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const xVal = info.offset.x;

    if (xVal > SWIPE_THRESHOLD) {
      animate(x, 600, { duration: 0.35, ease: "easeOut" });
      setTimeout(onSwipeRight, 200);
    } else if (xVal < -SWIPE_THRESHOLD) {
      animate(x, -600, { duration: 0.35, ease: "easeOut" });
      setTimeout(onSwipeLeft, 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 28 });
    }
  };

  const stackOffset = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.04;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : stackOffset,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? cardOpacity : 1,
        scale: isTop ? 1 : stackScale,
        zIndex: 10 - stackIndex,
        originY: 1,
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Card */}
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Background Image */}
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* LIKE overlay */}
        <motion.div
          style={{ opacity: likeOpacity, scale: likeScale }}
          className="absolute top-12 left-6 border-4 border-emerald-400 rounded-2xl px-4 py-2 rotate-[-20deg]"
        >
          <span className="text-emerald-400 text-2xl tracking-wider">YUM! 😋</span>
        </motion.div>

        {/* NOPE overlay */}
        <motion.div
          style={{ opacity: nopeOpacity, scale: nopeScale }}
          className="absolute top-12 right-6 border-4 border-red-400 rounded-2xl px-4 py-2 rotate-[20deg]"
        >
          <span className="text-red-400 text-2xl tracking-wider">NOPE 😑</span>
        </motion.div>

        {/* Cuisine badge */}
        <div className="absolute top-5 left-0 right-0 flex justify-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5">
            <span className="text-white text-sm">{food.cuisine}</span>
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h2 className="text-white text-3xl mb-1">{food.name}</h2>
              <p className="text-white/80 text-sm leading-snug line-clamp-2 pr-4">
                {food.description}
              </p>

              {/* Tags */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {food.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Calorie pill */}
            <div className="shrink-0 bg-orange-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 mb-1">
              <Flame className="w-3 h-3" />
              {food.calories}
            </div>
          </div>

          {/* Swipe hint for top card */}
          {isTop && !isDragging && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <X className="w-3.5 h-3.5 text-red-300" />
                <span>swipe left to skip</span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <span>swipe right to find</span>
                <Heart className="w-3.5 h-3.5 text-emerald-300" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}