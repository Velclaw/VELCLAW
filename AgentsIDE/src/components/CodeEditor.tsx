import Editor from '@monaco-editor/react'
import './editor.css'

const starterCode = `import { useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('Ready')

  return (
    <main>
      <h1>AgentsIDE</h1>
      <p>{status}</p>
      <button onClick={() => setStatus('Built by Agent')}>
        Run agent
      </button>
    </main>
  )
}`

export function CodeEditor({ file }: { file: string }) {
  return (
    <div className="real-editor">
      <div className="editor-filebar">
        <span>{file}</span>
        <span className="editor-language">TypeScript React</span>
      </div>
      <Editor height="calc(100vh - 184px)" defaultLanguage="typescript" defaultValue={starterCode} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, lineHeight: 21, padding: { top: 14, bottom: 14 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on', smoothScrolling: true }} />
    </div>
  )
}
