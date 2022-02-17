const init = (app, PORT) => {
  app.use(todoRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
};

module.exports = init;
