import { Suspense } from "react";
import ClientPKPage from "./ClientPKPage";

export default function PKPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ClientPKPage />
    </Suspense>
  );
}

