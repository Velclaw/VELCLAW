import type { FileChange } from '../agent/types'

export function DiffView({ change }: { change: FileChange }) {
  const before = change.before.split('\n')
  const after = change.after.split('\n')
  return (
    <div className="diff-view">
      <div className="diff-header">
        <span>{change.path}</span>
        <span>{change.kind}</span>
      </div>
      <div className="diff-lines">
        {before.map((line, index) => (
          <div className="diff-line removed" key={`before-${index}`}>
            <span className="diff-sign">−</span><code>{line || ' '}</code>
          </div>
        ))}
        {after.map((line, index) => (
          <div className="diff-line added" key={`after-${index}`}>
            <span className="diff-sign">+</span><code>{line || ' '}</code>
          </div>
        ))}
      </div>
    </div>
  )
}
