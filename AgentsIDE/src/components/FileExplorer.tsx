import { ChevronDown, ChevronRight, FileCode2, FileJson, Folder, FolderOpen } from 'lucide-react'
import { useState } from 'react'

const sourceFiles = ['App.tsx', 'index.css', 'main.tsx']

export function FileExplorer({ activeFile, onSelect }: { activeFile: string; onSelect: (file: string) => void }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className="file-explorer">
      <div className="explorer-title">EXPLORER</div>
      <button className="tree-folder" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? <FolderOpen size={15} /> : <Folder size={15} />}
        <strong>src</strong>
      </button>
      {open && sourceFiles.map((file) => (
        <button key={file} className={`tree-file ${activeFile === file ? 'active' : ''}`} onClick={() => onSelect(file)}>
          {file.endsWith('.tsx') ? <FileCode2 size={15} /> : <FileJson size={15} />}
          <span>{file}</span>
        </button>
      ))}
      <button className="tree-file" onClick={() => onSelect('package.json')}>
        <FileJson size={15} />
        <span>package.json</span>
      </button>
    </aside>
  )
}
