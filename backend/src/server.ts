import server from "./app";
import { createServer } from "http";
import { initializeDatabase } from "./config/database";

const PORT = process.env.PORT || 8000;
const httpServer = createServer(server);

initializeDatabase();

// Error handlers
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
