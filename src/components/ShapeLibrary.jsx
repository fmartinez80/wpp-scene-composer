const ShapeLibrary = ({ onAddShape }) => {
  const categories = {
    Tableware: ['bowl', 'plate', 'fork', 'spoon'],
    Glassware: ['glass', 'cup'],
    Furniture: ['chair'],
    Primitives: ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane']
  }

  const getLabel = (shape) => {
    return shape.charAt(0).toUpperCase() + shape.slice(1)
  }

  return (
    <div className="shape-library">
      {Object.entries(categories).map(([category, shapes]) => (
        <div key={category} className="shape-category">
          <h4>{category}</h4>
          <div className="shape-grid">
            {shapes.map((shape) => (
              <button
                key={shape}
                className="shape-button"
                onClick={() => onAddShape(shape)}
                title={getLabel(shape)}
              >
                {getLabel(shape)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ShapeLibrary
