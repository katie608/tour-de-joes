import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.challenge.deleteMany();
  await prisma.store.deleteMany();

  await prisma.challenge.createMany({
    data: [
      // 10 pts
      {
        title: "Earning your Charlie Card",
        description: "Learn the MTA song (Charlie song) and perform it without any mistakes. You may take as many tries as it takes to get the song correct. Half points for 2 verses plus the chorus.",
        pointValue: 10,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 1,
      },
      // 8 pts
      {
        title: "30 Second Video",
        description: "Create a 30-second video and upload it to the group Google Drive. This must be separate from videos created for any other items.",
        pointValue: 8,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 2,
      },
      {
        title: "Fizz Mile",
        description: "One team member must run a mile, consuming at least 8oz of fizzy beverage before every quarter mile. Alcohol is neither prohibited nor encouraged, but drunk cycling is not allowed.",
        pointValue: 8,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 3,
      },
      {
        title: "Multisport Athlete",
        description: "One or more team members must complete a rock climb or 2 boulder problems at a climbing gym.",
        pointValue: 8,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 4,
      },
      // 6 pts
      {
        title: "Personification",
        description: "Without any pre-planning, one team member identifies a TJ's product to represent each team member including themselves. They write down the mappings. The other team members must correctly guess which item maps to which team member. Can be attempted at a different TJ's if failed, but no products can be reused.",
        pointValue: 6,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 5,
      },
      // 5 pts
      {
        title: "Alliterative Sandwich",
        description: "Generate a random letter. Make and eat a sandwich consisting of at least 3 foods starting with that letter. If you don't like the letter you can regenerate at the next store.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 6,
      },
      {
        title: "Off-Roading",
        description: "Ride or walk at least half a mile with your entire team on an unpaved path that is not on the official route. Strava or pics required — or it didn't happen.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 7,
      },
      {
        title: "Not-quila Shots",
        description: "Do salt → shot → lime but with a seasoning other than salt, a liquid other than tequila, and a fruit other than lime.",
        pointValue: 5,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 8,
      },
      {
        title: "Leaving the Game Board",
        description: "Cross I-95 within game time.",
        pointValue: 5,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 9,
      },
      {
        title: "Fix a Flat",
        description: "Do not intentionally cause a flat tire. However if you get one and fix it without professional help, you get 5 points! If you help someone else (other team or strangers) fix their flat (as long as you didn't cause it), your team also gets 5 points. Photo required. No limit to occurrences...unfortunately.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: null,
        sortOrder: 10,
      },
      {
        title: "Aiding the Enemy",
        description: "Without splitting up, obtain receipts from Trader Joe's and Whole Foods timestamped within 15 minutes of each other.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 11,
      },
      {
        title: "Go Swimming",
        description: "Move forward while submerged in water without touching the bottom.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 12,
      },
      {
        title: "Scavenger Hunt-ception",
        description: "Complete a scavenger hunt within a scavenger hunt. Find at least 5 of the following in under an hour: a tombstone of someone involved in the American Revolution, a building from before 1800, lobster (must see it in-person), a duck boat, a real duck, someone playing a musical instrument, a Dunkin' Donuts store.",
        pointValue: 5,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 13,
      },
      // 4 pts
      {
        title: "Potatoes and Molasses",
        description: "Take a photo of a plaque commemorating a food item or food item-related incident.",
        pointValue: 4,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 14,
      },
      // 3 pts
      {
        title: "The Influencer",
        description: "Purchase a skincare product and make a video review in which you unbox the product, use it, and say at least 4 things about it.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 15,
      },
      {
        title: "The Great Pumpkin Switcheroo",
        description: "Buy a decorative pumpkin or gourd from one Trader Joe's store, and deposit it in the equivalent display of another Trader Joe's store.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 16,
      },
      {
        title: "Cookie Monster",
        description: "One team member must put a cookie on their forehead and get it into their mouth using only their own facial muscles.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 17,
      },
      {
        title: "The 90s",
        description: "Eat 90 of something next to I-90. You may split 90 of something among team members.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 18,
      },
      {
        title: "Mother's Love",
        description: "Take a photo of a Duck Tours boat with a real egg.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 19,
      },
      {
        title: "Things Are Heating Up",
        description: "Buy, cook, and eat an item. The item must become hotter than human body temperature.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 20,
      },
      {
        title: "Emerald Necklace",
        description: "Photograph a team member posing in the Emerald Necklace park system while wearing a necklace made up of green things from TJ's. Other materials (e.g. string) may be purchased elsewhere.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 21,
      },
      {
        title: "Strava Artist",
        description: "Write 'TJ' on Strava by biking, running, or walking.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 22,
      },
      {
        title: "Pickle",
        description: "Make and eat a pickle.",
        pointValue: 3,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 23,
      },
      {
        title: "Supertaster",
        description: "One teammate buys an item. Another teammate must taste the item while blindfolded, then enter the store and identify the exact same item on the first try (organic apple and apple are different). Can be re-attempted at the next store with a different item if failed.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: null,
        sortOrder: 24,
      },
      {
        title: "Elderly Edifice",
        description: "Find and photograph a building or site that is older than the USA (Happy 250th!).",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 25,
      },
      {
        title: "Go Against the Flow",
        description: "Obtain at least 6oz of water from a river and bring it at least a mile upstream, then empty it back into the same river.",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 26,
      },
      {
        title: "Party Time",
        description: "Dump tea in the harbor near the Boston Tea Party Ships and Museum. Tea must be in a small quantity and a biodegradable form (liquid or loose leaf, not bags).",
        pointValue: 3,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 27,
      },
      // 2 pts
      {
        title: "Fearless Flyers",
        description: "Take a photo with your team (minus the photo taker) all in the air and looking fearless while one person holds a copy of the Fearless Flyer.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 28,
      },
      {
        title: "Under the Sea",
        description: "Correctly identify 3 Scandinavian swimmers in a row in a blindfolded taste test.",
        pointValue: 2,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 29,
      },
      {
        title: "Out of Your Comfort Zone",
        description: "Try an item that nobody in the group has tried before.",
        pointValue: 2,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 30,
      },
      {
        title: "The Impressionable Consumer",
        description: "Buy something after trying a free sample.",
        pointValue: 2,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 31,
      },
      {
        title: "Too Many",
        description: "Take a photo of one team member wearing all the team members' helmets at once.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 32,
      },
      {
        title: "Not Enough",
        description: "Take a photo of all the team members wearing one team member's helmet at once.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 33,
      },
      {
        title: "Adulting",
        description: "Get a flu shot if you have not already gotten one this season.",
        pointValue: 2,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 34,
      },
      {
        title: "Mary Poppins",
        description: "Film a video that uses forced perspective to pull at least one of your teammates out of a Trader Joe's bag.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 35,
      },
      {
        title: "Not What That's For",
        description: "Carry a solid food or container of food in your bike water bottle cage between stores.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 36,
      },
      {
        title: "Big Not-Spender",
        description: "Photograph a non-alcohol item over $15. No need to buy it.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 37,
      },
      {
        title: "Huh?",
        description: "Get your ID checked for a product other than an alcoholic beverage.",
        pointValue: 2,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 38,
      },
      {
        title: "Take a Dam Photo",
        description: "Take a photo of a dam. Max 2 photos (must be distinct dams).",
        pointValue: 2,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: 2,
        sortOrder: 39,
      },
      {
        title: "Eat Something Star Shaped",
        description: "Eat something star shaped outside of the Star Market that is over I-90.",
        pointValue: 2,
        mediaRequired: true,
        repeatable: false,
        sortOrder: 40,
      },
      // 1 pt repeatable
      {
        title: "Back to Basic",
        description: "Eat something pumpkin spice flavored, or apply a pumpkin-spice scented skincare product.",
        pointValue: 1,
        mediaRequired: false,
        repeatable: false,
        sortOrder: 41,
      },
      {
        title: "Take a River Photo",
        description: "Take a photo of a river. Max 5 points — must be distinct rivers.",
        pointValue: 1,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: 5,
        sortOrder: 42,
      },
      {
        title: "Take a Pond Photo",
        description: "Take a photo of a pond. Max 5 points — must be distinct ponds.",
        pointValue: 1,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: 5,
        sortOrder: 43,
      },
      {
        title: "Take a Bay/Ocean Photo",
        description: "Take a photo of a bay or ocean. Max 5 points — must be distinct bodies of water.",
        pointValue: 1,
        mediaRequired: true,
        repeatable: true,
        repeatLimit: 5,
        sortOrder: 44,
      },
    ],
  });

  await prisma.store.createMany({
    data: [
      { name: "Trader Joe's - Cambridge", location: "Cambridge, MA" },
      { name: "Trader Joe's - Back Bay", location: "Boston, MA" },
      { name: "Trader Joe's - Coolidge Corner", location: "Brookline, MA" },
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
