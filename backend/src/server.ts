import dotenv from "dotenv";
import app from "./app";
import { rabbitMQ } from "./config/rabbitmq";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await rabbitMQ.connect();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("Shutting down...");

  await rabbitMQ.disconnect();

  process.exit(0);
});

startServer();