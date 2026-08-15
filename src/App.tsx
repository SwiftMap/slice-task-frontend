import type { Task } from './data/tasks';
import { getStatusInfo } from './data/tasks';

interface Props {
  tasks: Task[];
}

export default function App({ tasks }: Props) {
  return (
    <div className="app-container">
      <div className="page-header">
        <h1>切片任务管理系统</h1>
        <p>管理无人机影像切片任务，查看任务进度与详情</p>
      </div>

      <div>
        {tasks.map((task) => {
          const status = getStatusInfo(task.status);
          const region = `${task.province} / ${task.city} / ${task.county}${
            task.town ? ' / ' + task.town : ''
          }`;
          return (
            <div className="task-card" key={task.id}>
              <div className="task-header">
                <div className="task-title">
                  <span>{task.name}</span>
                  <span className={`status-tag ${status.className}`}>
                    {status.text}
                  </span>
                </div>
              </div>
              <div className="task-stats">
                <div className="stat-item">
                  <div className="stat-title">任务时间</div>
                  <div className="stat-value">{task.taskTime}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-title">区域</div>
                  <div className="stat-value">{region}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-title">村庄数</div>
                  <div className="stat-value">
                    {task.villageCount}
                    <span className="unit">个</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-title">总面积</div>
                  <div className="stat-value">
                    {task.totalArea}
                    <span className="unit">km²</span>
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <a
                  className="btn btn-primary"
                  href={`./task.html?id=${task.id}`}
                >
                  查看详情 →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}