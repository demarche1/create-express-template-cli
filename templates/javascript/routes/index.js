const init = (app, PORT) => {
  app.get("/", (_req, resp) => {
    resp.json({ Hello: "World" });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
};

module.exports = init;
