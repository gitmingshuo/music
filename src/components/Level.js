import React from 'react';
import { useUser } from '../context/UserContext';
import { dailyTasks } from '../context/UserContext';
import './Level.css';

function Level() {
  const { userSettings, completeTask } = useUser();
  const progress = (userSettings.exp % 1000) / 10; // 转换为百分比

  const handleTaskComplete = (taskId) => {
    completeTask(taskId);
  };

  return (
    <div className="level-container">
      <div className="level-header">
        <h2>我的等级</h2>
      </div>
      
      <div className="level-content">
        <div className="level-card">
          <div className="level-info">
            <div className="current-level">
              <span className="level-number">Lv.{userSettings.level}</span>
              <span className="level-title">
                {userSettings.level < 5 ? '音乐爱好者' : 
                 userSettings.level < 10 ? '音乐达人' : '音乐大师'}
              </span>
            </div>
            <div className="level-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-text">
                距离下一等级还需要 {1000 - (userSettings.exp % 1000)} 经验
              </span>
            </div>
          </div>
        </div>

        <div className="daily-tasks">
          <h3>每日任务</h3>
          <div className="tasks-list">
            {dailyTasks.map((task) => (
              <div key={task.id} 
                className={`task-item ${userSettings.completedTasks.includes(task.id) ? 'completed' : ''}`}
              >
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <span className="task-exp">+{task.exp}经验</span>
                  <span className="task-desc">{task.description}</span>
                </div>
                <button 
                  className={`task-button ${userSettings.completedTasks.includes(task.id) ? 'completed' : ''}`}
                  onClick={() => handleTaskComplete(task.id)}
                  disabled={userSettings.completedTasks.includes(task.id)}
                >
                  {userSettings.completedTasks.includes(task.id) ? '已完成' : '去完成'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Level; 