import { PrismaClient, DishType } from "@prisma/client";

const prisma = new PrismaClient();

const dishes: Array<{ name: DishType; description: string }> = [
  { name: "bun_bo", description: "Bun bo with rich beef broth and herbs." },
  { name: "bun_dau", description: "Bun dau platter with tofu and fermented shrimp paste." },
  { name: "com_ga", description: "Vietnamese chicken rice with light broth." },
  { name: "com_tam", description: "Broken rice with grilled pork and pickles." },
  { name: "pho", description: "Classic pho noodle soup with aromatic spices." },
  { name: "banh_mi", description: "Crispy baguette with savory fillings." },
  { name: "bun_cha", description: "Grilled pork and rice vermicelli with dipping sauce." },
  { name: "hu_tieu", description: "Southern-style hu tieu noodle soup." },
  { name: "banh_xeo", description: "Crispy Vietnamese pancake with fresh herbs." },
  { name: "goi_cuon", description: "Fresh spring rolls with shrimp and herbs." },
  { name: "mi_quang", description: "Turmeric noodles with pork and peanuts." },
  { name: "bun_rieu", description: "Crab tomato noodle soup with tofu." },
  { name: "bun_bo_hue", description: "Spicy Hue beef noodle soup." },
  { name: "banh_cuon", description: "Steamed rice rolls with minced pork." },
  { name: "banh_canh", description: "Thick tapioca noodles in savory broth." },
  { name: "banh_beo", description: "Steamed rice cakes with shrimp floss." },
];

async function main() {
  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { name: dish.name },
      update: {
        description: dish.description,
        imageUrl: `/dishes/${dish.name}.jpg`,
      },
      create: {
        name: dish.name,
        description: dish.description,
        imageUrl: `/dishes/${dish.name}.jpg`,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
