import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import searchRoutes from "./routes/search.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use(errorHandler);

export default app;