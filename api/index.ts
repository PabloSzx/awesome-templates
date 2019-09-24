import notifier from "node-notifier";

import app from "./app";

app.set("trust proxy", true);

const port = process.env.PORT || 4000;

app.listen({ port }, () => {
  const message = `Server Listening on port ${port}!`;
  console.log(message);
  if (process.env.NODE_ENV !== "production") {
    notifier.notify({
      title: "🚀  API Server ready",
      message: `at http://localhost:${port}`,
    });
  }
});
