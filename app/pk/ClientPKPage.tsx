"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import GeneratePK from '@/components/GeneratePK';

export default function ClientPKPage() {
  const params = useSearchParams();
  const id = params ? params.get('id') : null;
  const [pkParams, setPkParams] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch('/api/pk-session?action=get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
        .then(res => res.json())
        .then(data => setPkParams(data));
    }
  }, [id]);

  if (!id) return <div>缺少参数 id</div>;
  if (!pkParams) return <div>加载中...</div>;

  return <GeneratePK {...pkParams} />;
}
