import { useState } from 'react'

const SceneManager = ({ objects, selectedObject, onSelect, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (obj) => {
    setEditingId(obj.id)
    setEditValue(obj.label)
  }

  const finishEdit = (id) => {
    onRename(id, editValue)
    setEditingId(null)
  }

  return (
    <div className="scene-manager">
      <div className="layers-header">
        <h3>Layers</h3>
      </div>

      {objects.length === 0 ? (
        <div className="empty-state">
          <p>Add a shape to begin</p>
        </div>
      ) : (
        <div className="layers-list">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`layer-item ${selectedObject === obj.id ? 'selected' : ''}`}
              onClick={() => onSelect(obj.id)}
            >
              <div className="layer-content">
                {editingId === obj.id ? (
                  <input
                    autoFocus
                    type="text"
                    maxLength="10"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => finishEdit(obj.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEdit(obj.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="label-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="label-text"
                    onDoubleClick={() => startEdit(obj)}
                    title="Double-click to rename"
                  >
                    {obj.label}
                  </span>
                )}
                <span className="type-badge">{obj.type}</span>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(obj.id)
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SceneManager
