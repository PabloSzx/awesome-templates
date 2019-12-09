import "dotenv/config";

import notifier from "node-notifier";

import app from "./app";

app.set("trust proxy", true);

const port = process.env.PORT || 4000;

app.listen({ port }, () => {
  console.log(`API Server Listening on port ${port}!`);
  if (process.env.NODE_ENV !== "production") {
    notifier.notify({
      title: "🚀  API Server ready",
      message: `at http://localhost:${port}`,
    });
  }
});
