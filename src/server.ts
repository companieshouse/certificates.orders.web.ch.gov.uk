import app from "./app";

app.listen(app.get("port"), () => {
  // tslint:disable-next-line
  console.log(`server listening on 0.0.0.0:${app.get("port")}`);
});
