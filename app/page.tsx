'use client';

import { useState, useMemo } from 'react';
import { MOCK_ISSUES, STATUSES } from '@/lib/mock-data';
import { Issue, Priority, IssueType, Status } from '@/lib/types';

const STATUS_CLASS: Record<Status, string> = {
  'Triage': 'triage',
  'In Progress': 'inprogress',
  'In Review': 'inreview',
  'Done': 'done',
};

const TYPE_CLASS: Record<IssueType, string> = {
  'Bug': 'bug',
  'Feature Request': 'feature-request',
  'Other': 'other',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority-badge ${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

function CardModal({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{issue.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="modal-badges">
            <span className={`card-type-badge ${TYPE_CLASS[issue.type]}`}>{issue.type}</span>
            <PriorityBadge priority={issue.priority} />
            <span className="card-issue-number">#{issue.github_issue_number}</span>
          </div>
          <div className="modal-field">
            <div className="modal-field-label">Component</div>
            <div className="modal-field-value">{issue.component}</div>
          </div>
          <div className="modal-field">
            <div className="modal-field-label">Description</div>
            <div className="modal-field-value">{issue.description}</div>
          </div>
          {issue.steps_to_reproduce && (
            <div className="modal-field">
              <div className="modal-field-label">Steps to Reproduce</div>
              <div className="modal-field-value">{issue.steps_to_reproduce}</div>
            </div>
          )}
          <div className="modal-divider" />
          <div className="modal-field">
            <div className="modal-field-label">Submitted by</div>
            <div className="modal-field-value muted">{issue.submitted_by}</div>
          </div>
          <div className="modal-field">
            <div className="modal-field-label">Submitted on</div>
            <div className="modal-field-value muted">
              {new Date(issue.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          </div>
          <div className="modal-divider" />
          <a className="github-link" href={`https://github.com/YOUR_ORG/YOUR_REPO/issues/${issue.github_issue_number}`} target="_blank" rel="noopener noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-top">
        <span className={`card-type-badge ${TYPE_CLASS[issue.type]}`}>{issue.type}</span>
        <span className="card-issue-number">#{issue.github_issue_number}</span>
      </div>
      <div className="card-title">{issue.title}</div>
      <div className="card-component">{issue.component}</div>
      <div className="card-footer">
        <PriorityBadge priority={issue.priority} />
        <span className="card-submitter">{issue.submitted_by}</span>
        <span className="card-date">{formatDate(issue.timestamp)}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterComponent, setFilterComponent] = useState<string>('All');

  const components = useMemo(() => {
    const all = MOCK_ISSUES.map(i => i.component);
    return ['All', ...Array.from(new Set(all)).sort()];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ISSUES.filter(issue => {
      if (filterType !== 'All' && issue.type !== filterType) return false;
      if (filterPriority !== 'All' && issue.priority !== filterPriority) return false;
      if (filterComponent !== 'All' && issue.component !== filterComponent) return false;
      return true;
    });
  }, [filterType, filterPriority, filterComponent]);

  const byStatus = useMemo(() => {
    const map: Record<Status, Issue[]> = {
      'Triage': [], 'In Progress': [], 'In Review': [], 'Done': [],
    };
    filtered.forEach(issue => map[issue.status].push(issue));
    return map;
  }, [filtered]);

  const total = MOCK_ISSUES.length;
  const open = MOCK_ISSUES.filter(i => i.status !== 'Done').length;
  const urgent = MOCK_ISSUES.filter(i => i.priority === 'Urgent').length;
  const done = MOCK_ISSUES.filter(i => i.status === 'Done').length;

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-logo">
          <span className="navbar-logo-dot" />
          {'Turing'}
        </a>
        <div className="navbar-divider" />
        <span className="navbar-title">Pearl Evals Platform Issue Tracker</span>
        <div className="navbar-spacer" />
        <span className="navbar-meta">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      </nav>

      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Issue Board</h1>
            <p className="page-subtitle">Track bugs and feature requests across all components</p>
          </div>
          <div className="filters">
            <span className="filter-label">Filter:</span>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="All">All types</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Other">Other</option>
            </select>
            <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="All">All priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="filter-select" value={filterComponent} onChange={e => setFilterComponent(e.target.value)}>
              {components.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All components' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{open}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-urgent)' }}>{urgent}</div>
            <div className="stat-label">Urgent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-done)' }}>{done}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>

        <div className="kanban">
          {STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className={`kanban-column-header ${STATUS_CLASS[status]}`}>
                <span className="kanban-column-title">{status}</span>
                <span className="kanban-count">{byStatus[status].length}</span>
              </div>
              <div className="kanban-cards">
                {byStatus[status].length === 0 ? (
                  <div className="kanban-empty">No issues here</div>
                ) : (
                  byStatus[status].map(issue => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onClick={() => setSelectedIssue(issue)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedIssue && (
        <CardModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </>
  );
}