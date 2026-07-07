import { Suspense } from "react";
import { CatalogoView } from "@/features/catalog/CatalogoView";

export const metadata = {
  title: "Catálogo | OppaStore",
};

export default function CatalogoPage() {
  return (
    <Suspense>
      <CatalogoView />
    </Suspense>
  );
}
