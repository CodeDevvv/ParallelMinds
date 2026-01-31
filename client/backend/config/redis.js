import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
    console.log("✅ Redis Connected Successfully");
});

redis.on("error", (err) => {
    console.error("❌ Redis Connection Error:", err);
});

export default redis;