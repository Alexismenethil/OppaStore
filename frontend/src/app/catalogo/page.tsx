import { Suspense } from "react";
import { CatalogoView } from "@/features/catalog/CatalogoView";
import CatalogoLoading from "./loading";

export const metadata = {
  title: "Catálogo | OppaStore",
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogoLoading />}>
      <CatalogoView />
    </Suspense>
  );
}
