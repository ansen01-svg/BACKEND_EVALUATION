import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import { initRateLimiters } from "./middleware/rateLimiter";

async function startServer() {
  await connectDB();
  await connectRedis();
  initRateLimiters();

  app.listen(process.env.PORT, () => {
    console.log(
      `\n🚀 LW3 Supply Chain API running on http://localhost:${process.env.PORT}\n`,
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
