import './app.css';

import { type ResolvedToolConfig, groupToolsByGame } from '@my-game-tools/config';
import {
  AppShell,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
  ToolCard,
} from '@my-game-tools/ui';

import toolsData from './generated/tools.generated.json';

const tools = toolsData as ResolvedToolConfig[];
const toolGroups = Array.from(groupToolsByGame(tools).entries());

function getStatusTone(status: ResolvedToolConfig['status']) {
  switch (status) {
    case 'stable':
      return 'success';
    case 'beta':
      return 'warning';
    case 'experimental':
      return 'info';
    default:
      return 'neutral';
  }
}

export default function App() {
  const backendEnabledCount = tools.filter((tool) => tool.hasBackend).length;

  return (
    <AppShell
      brand="Portal"
      footer="统一门户、统一主题、统一发布链路。"
      navigation={
        <>
          <a href="#tool-groups">工具总览</a>
          <a href="https://github.com/zdy85730/my-game-tools">GitHub</a>
        </>
      }
    >
      <PageHeader
        actions={
          <div className="portal-hero-actions">
            <PrimaryButton href="#tool-groups">浏览工具</PrimaryButton>
            <SecondaryButton href="https://github.com/zdy85730/my-game-tools">
              查看仓库
            </SecondaryButton>
          </div>
        }
        description="My Game Tools 是一套面向游戏相关网页工具的统一工作台。前端默认纯静态发布，必要时再为单个工具接入后端服务。"
        eyebrow="Industrial Gray Toolkit"
        title="统一收纳多工具，固定一套产品语言。"
      />

      <section className="mgt-grid mgt-grid--stats">
        <StatCard
          hint="门户自动扫描并收录工具配置。"
          label="工具数量"
          value={String(tools.length)}
        />
        <StatCard
          hint="按游戏分组展示，每组保持独立入口。"
          label="游戏分组"
          value={String(toolGroups.length)}
        />
        <StatCard
          hint="仅在确实需要时才引入服务端。"
          label="后端工具"
          value={String(backendEnabledCount)}
        />
      </section>

      <Panel
        description="这套仓库默认偏向纯前端发布，但不会牺牲统一结构、统一设计语言和自动化部署能力。"
        striped
        title="仓库基线"
      >
        <div className="portal-meta">
          <StatusBadge tone="success">Pages Auto Deploy</StatusBadge>
          <StatusBadge tone="info">Docker Compose Backend</StatusBadge>
          <StatusBadge tone="neutral">Biome + Stylelint</StatusBadge>
          <StatusBadge tone="warning">PR Driven Main</StatusBadge>
        </div>
      </Panel>

      <div className="portal-section" id="tool-groups">
        {toolGroups.map(([gameId, groupedTools]) => (
          <section className="portal-section" key={gameId}>
            <div className="portal-section__header">
              <div>
                <h2>{gameId}</h2>
                <p>保持同一视觉系统下的独立工具集合。</p>
              </div>
              <StatusBadge tone="neutral">{groupedTools.length} tools</StatusBadge>
            </div>
            <div className="mgt-grid mgt-grid--cards">
              {groupedTools.map((tool) => (
                <ToolCard
                  key={tool.toolId}
                  description={tool.description}
                  footer={
                    <>
                      <StatusBadge tone={getStatusTone(tool.status)}>
                        {tool.status ?? 'stable'}
                      </StatusBadge>
                      {tool.hasBackend ? <StatusBadge tone="info">backend</StatusBadge> : null}
                    </>
                  }
                  href={`${import.meta.env.BASE_URL}${tool.pagesPath}/`}
                  title={tool.title}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
