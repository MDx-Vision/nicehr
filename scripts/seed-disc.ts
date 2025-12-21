import { seedDiscData } from "../server/seedDiscData";
import { getDiscDashboardStats } from "../server/discStorage";

async function main() {
  console.log("\n=== Seeding DiSC Data ===\n");

  try {
    await seedDiscData();

    console.log("\n=== Fetching Dashboard Stats ===\n");
    const stats = await getDiscDashboardStats();

    console.log("Dashboard Stats:");
    console.log(JSON.stringify(stats, null, 2));

    console.log("\n=== DiSC Seed Complete ===\n");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
