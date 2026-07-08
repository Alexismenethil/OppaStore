import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { crearApp } from "./app";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const port = Number(process.env.PORT ?? 4000);

crearApp().listen(port, () => {
  console.log(`💚 OppaStore API escuchando en http://localhost:${port}/api/v1`);
});
