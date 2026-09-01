import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.challenge.deleteMany();
  await prisma.store.deleteMany();

  await prisma.challenge.createMany({
    data: [
      {
        title: "Find the Hawaiian Shirt",
        description: "Take a photo of a team member wearing a Hawaiian shirt inside the store.",
        pointValue: 10,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 1,
      },
      {
        title: "Try a Free Sample",
        description: "Confirm that your team tried a free sample at the sample station.",
        pointValue: 5,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 2,
      },
      {
        title: "Cart Train",
        description: "Video your team forming a 'cart train' and pushing it down an aisle.",
        pointValue: 15,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 3,
      },
      {
        title: "Find a Hidden Cow",
        description: "Trader Joe's stores have hidden plastic cows. Photograph one!",
        pointValue: 10,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: 3,
        sortOrder: 4,
      },
      {
        title: "Compliment an Employee",
        description: "Confirm your team gave a genuine compliment to a Trader Joe's crew member.",
        pointValue: 5,
        mediaRequired: false,
        repeatable: true,
        repeatLimit: 5,
        sortOrder: 5,
      },
      {
        title: "Find the Cheapest Item in the Store",
        description: "Photograph the price tag of the cheapest item you can find.",
        pointValue: 10,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 6,
      },
      {
        title: "Team Selfie at the Flower Display",
        description: "Take a group selfie with the flower display in the background.",
        pointValue: 10,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 7,
      },
      {
        title: "Name 3 Trader Joe's Exclusive Brands",
        description: "Confirm your team can name three of Trader Joe's private label brands (e.g. Trader Jose's, Trader Giotto's).",
        pointValue: 5,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 8,
      },
      {
        title: "Visit a New Store",
        description: "Confirm your team has physically visited a Trader Joe's location not yet claimed by anyone.",
        pointValue: 20,
        mediaRequired: false,
        repeatable: true,
        repeatLimit: 10,
        sortOrder: 9,
      },
    ],
  });

  await prisma.store.createMany({
    data: [
      { name: "Trader Joe's - Capitol Hill", location: "Seattle, WA" },
      { name: "Trader Joe's - Ballard", location: "Seattle, WA" },
      { name: "Trader Joe's - University Village", location: "Seattle, WA" },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
