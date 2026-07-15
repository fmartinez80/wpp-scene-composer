import '../styles/LayersPanel.css'

const LayersPanel = ({ objects, selectedObjectId, onSelectObject, onDeleteObject }) => {
  // Group objects by type and count
  const objectCounts = {}
  objects.forEach(obj => {
    const key = obj.type
    objectCounts[key] = (objectCounts[key] || 0) + 1
  })

  // Get unique types in order they appear
  const uniqueTypes = [...new Set(objects.map(obj => obj.type))]

  const handleDelete = (e, id) => {
    e.stopPropagation()
    onDeleteObject(id)
  }

  return (
    <div className="layers-panel">
      <div className="layers-header">LAYERS</div>

      <div className="layers-list">
        {uniqueTypes.length === 0 ? (
          <div className="empty-state">Add items to scene</div>
        ) : (
          uniqueTypes.map(type => (
            <div key={type} className="layer-group">
              <div className="layer-group-header">
                <span className="group-name">{type}</span>
                <span className="group-count">({objectCounts[type]})</span>
              </div>
              <div className="layer-items">
                {objects
                  .filter(obj => obj.type === type)
                  .map((obj) => (
                    <div
                      key={obj.id}
                      className={`layer-item ${selectedObjectId === obj.id ? 'selected' : ''}`}
                      onClick={() => onSelectObject(obj.id)}
                    >
                      <span className="layer-label">{obj.type}</span>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDelete(e, obj.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LayersPanel
