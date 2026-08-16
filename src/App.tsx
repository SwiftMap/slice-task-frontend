import { useMemo, useState } from 'react';
import type { Task } from './data/tasks';
import { getStatusInfo, getZoomRange } from './data/tasks';

interface Props {
  tasks: Task[];
}

const PAGE_SIZE = 20;

export default function App({ tasks }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [tasks, safePage]);

  // 页码窗口：首尾 + 当前 + 省略号
  const pageNumbers = useMemo(() => {
    const pages: (number | '…')[] = [];
    const window = 1; // 当前页前后各显示 1 个
    const add = (n: number) => pages.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (safePage - window > 2) pages.push('…');
      for (
        let i = Math.max(2, safePage - window);
        i <= Math.min(totalPages - 1, safePage + window);
        i++
      ) {
        add(i);
      }
      if (safePage + window < totalPages - 1) pages.push('…');
      add(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>切片任务管理系统</h1>
        <p>管理无人机影像切片任务，查看任务进度与详情</p>
      </div>

      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th className="col-name">任务名称</th>
              <th className="col-region">区域</th>
              <th className="col-time">任务时间</th>
              <th className="col-zoom">缩放范围</th>
              <th className="col-villages">村庄数</th>
              <th className="col-area">总面积 (km²)</th>
              <th className="col-status">状态</th>
              <th className="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedTasks.map((task) => {
              const status = getStatusInfo(task.status);
              const region = `${task.province} / ${task.city} / ${task.county}${
                task.town ? ' / ' + task.town : ''
              }`;
              const zoom = getZoomRange(task);
              return (
                <tr key={task.id}>
                  <td className="col-name">{task.name}</td>
                  <td className="col-region">{region}</td>
                  <td className="col-time">{task.taskTime}</td>
                  <td className="col-zoom">{zoom ?? '—'}</td>
                  <td className="col-villages">{task.villageCount}</td>
                  <td className="col-area">{task.totalArea}</td>
                  <td className="col-status">
                    <span className={`status-tag ${status.className}`}>{status.text}</span>
                  </td>
                  <td className="col-action">
                    <a
                      className="btn btn-primary"
                      href={`./task.html?id=${task.id}`}
                    >
                      查看详情 →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="empty-tip">暂无任务</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
          >
            ← 上一页
          </button>
          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`e-${i}`} className="page-ellipsis">…</span>
            ) : (
              <button
                key={n}
                className={`page-btn ${n === safePage ? 'active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            )
          )}
          <button
            className="page-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            下一页 →
          </button>
          <span className="page-info">
            共 {tasks.length} 条 · 第 {safePage} / {totalPages} 页
          </span>
        </div>
      )}
    </div>
  );
}
