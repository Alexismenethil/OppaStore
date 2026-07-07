import "dotenv/config";
import { crearApp } from "./app";

const port = Number(process.env.PORT ?? 4000);

crearApp().listen(port, () => {
  console.log(`💚 OppaStore API escuchando en http://localhost:${port}/api/v1`);
});
