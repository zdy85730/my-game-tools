import './app.css';

import { useEffect, useMemo, useState } from 'react';

import {
  AppShell,
  DataTable,
  FilterBar,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
} from '@my-game-tools/ui';

import toolConfig from '../tool.config';

interface Loadout {
  id: string;
  operator: string;
  role: string;
  burst: string;
  survivability: string;
}

export default function App() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setStatus('loading');

      try {
        const response = await fetch('/api/loadouts');
        const payload = (await response.json()) as { items: Loadout[] };

        if (!cancelled) {
          setLoadouts(payload.items);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (selectedRole === 'all') {
      return loadouts;
    }

    return loadouts.filter((loadout) => loadout.role === selectedRole);
  }, [loadouts, selectedRole]);

  const portalHref = import.meta.env.VITE_PORTAL_ROOT ?? '/';

  return (
    <AppShell
      brand={toolConfig.title}
      footer="Battle lab · frontend + backend sample."
      navigation={<a href={portalHref}>返回门户</a>}
      toolbar={<StatusBadge tone={status === 'error' ? 'danger' : 'info'}>{status}</StatusBadge>}
    >
      <div className="battle-lab">
        <PageHeader
          actions={
            <div className="battle-lab__toolbar">
              <PrimaryButton href={portalHref}>全部工具</PrimaryButton>
              <SecondaryButton href="https://82.156.192.108">生产服务器</SecondaryButton>
            </div>
          }
          description={toolConfig.description}
          eyebrow="Frontend + Backend"
          title="用统一面板验证接口、部署和工作台布局。"
        />

        <section className="mgt-grid mgt-grid--stats">
          <StatCard
            hint="当前前端接到的阵容条目。"
            label="阵容样本"
            value={String(loadouts.length)}
          />
          <StatCard
            hint="当前筛选结果的数量。"
            label="筛选结果"
            value={String(filteredRows.length)}
          />
          <StatCard hint="当前是否依赖服务端。" label="后端依赖" value="Yes" />
        </section>

        <Panel
          description="本地开发时通过 Vite proxy 访问 Fastify 服务。"
          striped
          title="筛选与联调"
        >
          <FilterBar>
            <label>
              阵容角色
              <select
                value={selectedRole}
                onChange={(event) => {
                  setSelectedRole(event.target.value);
                }}
              >
                <option value="all">全部</option>
                <option value="Assault">Assault</option>
                <option value="Control">Control</option>
                <option value="Support">Support</option>
              </select>
            </label>
          </FilterBar>
        </Panel>

        <Panel description="这里演示统一表格样式在接口数据上的落地方式。" title="阵容结果">
          <DataTable
            columns={[
              { key: 'operator', header: '操作员' },
              { key: 'role', header: '角色' },
              { key: 'burst', header: '爆发' },
              { key: 'survivability', header: '生存' },
            ]}
            emptyState="当前没有可展示的阵容。"
            getRowKey={(row) => row.id}
            rows={filteredRows}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
