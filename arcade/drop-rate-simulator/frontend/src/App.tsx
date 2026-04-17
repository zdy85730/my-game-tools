import './app.css';

import { useMemo, useState } from 'react';

import { AppShell, FilterBar, PageHeader, Panel, PrimaryButton, StatCard } from '@my-game-tools/ui';

import toolConfig from '../tool.config';

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default function App() {
  const [dropRateInput, setDropRateInput] = useState('18');
  const [runCountInput, setRunCountInput] = useState('12');

  const dropRate = Number(dropRateInput) / 100;
  const runCount = Number(runCountInput);

  const derived = useMemo(() => {
    const safeDropRate = Number.isFinite(dropRate) ? Math.min(Math.max(dropRate, 0), 1) : 0;
    const safeRunCount = Number.isFinite(runCount) ? Math.max(runCount, 0) : 0;
    const noDropChance = (1 - safeDropRate) ** safeRunCount;
    const atLeastOne = 1 - noDropChance;
    const expectedDrops = safeDropRate * safeRunCount;

    return {
      safeDropRate,
      safeRunCount,
      noDropChance,
      atLeastOne,
      expectedDrops,
    };
  }, [dropRate, runCount]);

  const portalHref = import.meta.env.VITE_PORTAL_ROOT ?? '/';

  return (
    <AppShell
      brand={toolConfig.title}
      footer="Drop-rate simulator · frontend only sample."
      navigation={<a href={portalHref}>返回门户</a>}
    >
      <div className="tool-layout">
        <PageHeader
          actions={<PrimaryButton href={portalHref}>查看全部工具</PrimaryButton>}
          description={toolConfig.description}
          eyebrow="Frontend Only"
          title="快速估算掉落收益和清体力预期。"
        />

        <Panel
          description="输入基础掉落率和刷取次数，系统会给出最直接的结果摘要。"
          striped
          title="参数输入"
        >
          <FilterBar>
            <label>
              掉落率（%）
              <input
                max="100"
                min="0"
                type="number"
                value={dropRateInput}
                onChange={(event) => {
                  setDropRateInput(event.target.value);
                }}
              />
            </label>
            <label>
              刷取次数
              <input
                min="0"
                type="number"
                value={runCountInput}
                onChange={(event) => {
                  setRunCountInput(event.target.value);
                }}
              />
            </label>
          </FilterBar>
        </Panel>

        <section className="tool-grid">
          <StatCard
            hint="至少掉出一次的概率。"
            label="至少一掉"
            value={formatPercent(derived.atLeastOne)}
          />
          <StatCard
            hint="全程一无所获的概率。"
            label="零掉概率"
            value={formatPercent(derived.noDropChance)}
          />
          <StatCard
            hint="数学期望下的平均掉落数。"
            label="期望掉落"
            value={derived.expectedDrops.toFixed(2)}
          />
        </section>

        <Panel description="这个工具不依赖后端，适合作为纯前端工具模板的起点。" title="说明">
          <div className="tool-copy">
            <p>掉落率模拟器演示了统一筛选条、统计卡和说明面板在纯前端工具中的组合方式。</p>
            <p>本地开发时使用根仓脚本统一管理，正式构建时自动落到 GitHub Pages 的子路径。</p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
